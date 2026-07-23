import { useCallback, useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";

const WEBSOCKET_URL = import.meta.env.VITE_YJS_WEBSOCKET_URL;

if (!WEBSOCKET_URL && import.meta.env.PROD) {
  console.error(
    "VITE_YJS_WEBSOCKET_URL is not set — collaboration will not work.",
  );
}

const WS_URL = WEBSOCKET_URL ?? "ws://localhost:1234";

const getTextName = (language) => `code-${language}`;

const useCollaborativeEditor = ({
  sessionId,
  starterCode = {},
  defaultLanguage = "javascript",
  onLanguageChange,
}) => {
  const yDocRef = useRef(null);
  const yMetaRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const editorRef = useRef(null);
  const starterCodeRef = useRef(starterCode);
  const onLanguageChangeRef = useRef(onLanguageChange);
  const seededLanguagesRef = useRef(new Set());
  const languageRef = useRef(defaultLanguage);

  const [language, setLanguageState] = useState(defaultLanguage);

  useEffect(() => {
    starterCodeRef.current = starterCode;
  }, [starterCode]);

  useEffect(() => {
    onLanguageChangeRef.current = onLanguageChange;
  }, [onLanguageChange]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const seedLanguageIfEmpty = useCallback((lang) => {
    const yDoc = yDocRef.current;
    if (!yDoc || seededLanguagesRef.current.has(lang)) return;

    const yText = yDoc.getText(getTextName(lang));
    if (yText.length === 0) {
      const starter = starterCodeRef.current?.[lang];
      if (starter) {
        yDoc.transact(() => {
          yText.insert(0, starter);
        }, "initialize-code");
      }
    }
    seededLanguagesRef.current.add(lang);
  }, []);

  const rebindEditor = useCallback(
    (lang) => {
      const yDoc = yDocRef.current;
      const provider = providerRef.current;
      const editor = editorRef.current;

      if (!yDoc || !provider || !editor) return;

      const model = editor.getModel();
      if (!model) return;

      bindingRef.current?.destroy();
      bindingRef.current = null;

      seedLanguageIfEmpty(lang);

      const yText = yDoc.getText(getTextName(lang));

      bindingRef.current = new MonacoBinding(
        yText,
        model,
        new Set([editor]),
        provider.awareness,
      );
    },
    [seedLanguageIfEmpty],
  );

  const handleEditorMount = useCallback(
    (editor) => {
      editorRef.current = editor;
      rebindEditor(languageRef.current);
    },
    [rebindEditor],
  );

  // Rebind whenever the shared language changes (local or remote)
  useEffect(() => {
    if (editorRef.current) {
      rebindEditor(language);
    }
  }, [language, rebindEditor]);

  useEffect(() => {
    if (!sessionId) return undefined;

    const yDoc = new Y.Doc();
    const provider = new WebsocketProvider(WS_URL, sessionId, yDoc);
    const yMeta = yDoc.getMap("session-meta");

    yDocRef.current = yDoc;
    providerRef.current = provider;
    yMetaRef.current = yMeta;

    const applySharedLanguage = () => {
      const sharedLanguage = yMeta.get("language");
      if (sharedLanguage && sharedLanguage !== languageRef.current) {
        setLanguageState(sharedLanguage);
        onLanguageChangeRef.current?.(sharedLanguage);
      }
    };

    const handleSync = (isSynced) => {
      if (!isSynced) return;

      if (!yMeta.has("language")) {
        yMeta.set("language", languageRef.current);
      } else {
        applySharedLanguage();
      }

      const activeLang = yMeta.get("language") ?? languageRef.current;
      seedLanguageIfEmpty(activeLang);

      if (editorRef.current) {
        rebindEditor(activeLang);
      }
    };

    yMeta.observe(applySharedLanguage);
    provider.on("sync", handleSync);

    return () => {
      yMeta.unobserve(applySharedLanguage);
      provider.off("sync", handleSync);

      bindingRef.current?.destroy();
      bindingRef.current = null;

      provider.destroy();
      yDoc.destroy();

      yDocRef.current = null;
      yMetaRef.current = null;
      providerRef.current = null;
      editorRef.current = null;
      seededLanguagesRef.current = new Set();
    };
  }, [sessionId, rebindEditor, seedLanguageIfEmpty]);

  const setSharedLanguage = useCallback((lang) => {
    yMetaRef.current?.set("language", lang);
    setLanguageState(lang);
    onLanguageChangeRef.current?.(lang);
  }, []);

  const getCurrentCode = useCallback(() => {
    const yDoc = yDocRef.current;
    if (!yDoc) return "";
    return yDoc.getText(getTextName(languageRef.current)).toString();
  }, []);

  return {
    handleEditorMount,
    language,
    setSharedLanguage,
    getCurrentCode,
  };
};

export default useCollaborativeEditor;
