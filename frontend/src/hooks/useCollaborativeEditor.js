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

const getTextName = (language) => `code-${language}`;

const useCollaborativeEditor = ({
  sessionId,
  starterCode = {},
  defaultLanguage = "javascript",
  onLanguageChange,
  userName,
  isHost,
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
  const isHostRef = useRef(isHost);

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

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  const seedLanguageIfEmpty = useCallback((lang) => {
    if (!isHostRef.current) {
      return;
    }

    const yDoc = yDocRef.current;
    if (!yDoc) return;

    const yText = yDoc.getText(getTextName(lang));

    if (yText.length > 0) {
      seededLanguagesRef.current.add(lang);
      return;
    }

    const starter = starterCodeRef.current?.[lang];
    if (starter) {
      yDoc.transact(() => {
        yText.insert(0, starter);
      }, "initialize-code");
      console.log(`Seeded ${lang}`, yText.toString());
      seededLanguagesRef.current.add(lang);
    }
  }, []);

  const rebindEditor = useCallback((lang) => {
    const yDoc = yDocRef.current;
    const provider = providerRef.current;
    const editor = editorRef.current;

    if (!yDoc || !provider || !editor) return;

    const model = editor.getModel();
    if (!model) return;

    bindingRef.current?.destroy();
    bindingRef.current = null;

    const yText = yDoc.getText(getTextName(lang));

    bindingRef.current = new MonacoBinding(
      yText,
      model,
      new Set([editor]),
      provider.awareness,
    );

    setTimeout(() => {
      console.log("Decorations:", editor.getModel().getAllDecorations());
    }, 2000);
  }, []);

  const handleEditorMount = useCallback(
    (editor) => {
      editorRef.current = editor;
      rebindEditor(languageRef.current);
    },
    [rebindEditor],
  );

  useEffect(() => {
    if (!editorRef.current) return;

    // Create starter code for this language if it doesn't exist
    seedLanguageIfEmpty(language);

    // Then bind the editor to that language
    rebindEditor(language);
  }, [language, rebindEditor, seedLanguageIfEmpty]);

  useEffect(() => {
    console.log("INIT EFFECT");
    if (!sessionId) return undefined;

    const yDoc = new Y.Doc();
    const provider = new WebsocketProvider(WEBSOCKET_URL, sessionId, yDoc);
    const yMeta = yDoc.getMap("session-meta");

    const userColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
    provider.awareness.setLocalStateField("user", {
      name: userName || "Anonymous",
      color: userColor,
    });
    provider.awareness.on("change", () => {
      console.log(
        "Awareness:",
        Array.from(provider.awareness.getStates().entries()),
      );
    });

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

      setTimeout(() => {
        if (editorRef.current) {
          rebindEditor(activeLang);
        }
      }, 0);
    };

    yMeta.observe(applySharedLanguage);
    provider.on("sync", handleSync);

    return () => {
      console.log("CLEANUP EFFECT");
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

  useEffect(() => {
    if (!isHost) return;
    if (!yDocRef.current) return;

    const lang = yMetaRef.current?.get("language") ?? languageRef.current;

    seedLanguageIfEmpty(lang);

    if (editorRef.current) {
      rebindEditor(lang);
    }
  }, [isHost, seedLanguageIfEmpty, rebindEditor]);

  const setSharedLanguage = useCallback(
    (lang) => {
      yMetaRef.current?.set("language", lang);

      // Ensure the Y.Text exists for this language
      seedLanguageIfEmpty(lang);

      setLanguageState(lang);
      onLanguageChangeRef.current?.(lang);
    },
    [seedLanguageIfEmpty],
  );

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
