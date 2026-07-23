import { useCallback, useEffect, useRef } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";

const DEFAULT_WEBSOCKET_URL =
  import.meta.env.VITE_YJS_WEBSOCKET_URL ?? "ws://localhost:1234";

const Y_TEXT_NAME = "shared-code";

const useCollaborativeEditor = ({
  sessionId,
  starterCode = "",
  onRemoteCodeChange,
}) => {
  const yDocRef = useRef(null);
  const yTextRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const editorRef = useRef(null);
  const starterCodeRef = useRef(starterCode);
  const remoteCodeChangeRef = useRef(onRemoteCodeChange);
  const seededInitialCodeRef = useRef(false);

  useEffect(() => {
    starterCodeRef.current = starterCode;
  }, [starterCode]);

  useEffect(() => {
    remoteCodeChangeRef.current = onRemoteCodeChange;
  }, [onRemoteCodeChange]);

  const notifyRemoteCodeChange = useCallback((nextCode) => {
    remoteCodeChangeRef.current?.(nextCode);
  }, []);

  const maybeCreateBinding = useCallback(() => {
    if (bindingRef.current || !editorRef.current || !providerRef.current) {
      return;
    }

    const model = editorRef.current.getModel();

    if (!model || !yTextRef.current) {
      return;
    }

    bindingRef.current = new MonacoBinding(
      yTextRef.current,
      model,
      new Set([editorRef.current]),
      providerRef.current.awareness,
    );
  }, []);

  const handleEditorMount = useCallback(
    (editor) => {
      editorRef.current = editor;
      maybeCreateBinding();
    },
    [maybeCreateBinding],
  );

  useEffect(() => {
    if (!sessionId) {
      return undefined;
    }

    const yDoc = new Y.Doc();
    const provider = new WebsocketProvider(
      DEFAULT_WEBSOCKET_URL,
      sessionId,
      yDoc,
    );
    const yText = yDoc.getText(Y_TEXT_NAME);

    const handleSharedTextUpdate = () => {
      const nextCode = yText.toString();

      if (nextCode.length > 0) {
        seededInitialCodeRef.current = true;
      }

      notifyRemoteCodeChange(nextCode);
    };

    const handleProviderSync = (isSynced) => {
      if (!isSynced) {
        return;
      }

      if (!seededInitialCodeRef.current && yText.length === 0) {
        const initialCode = starterCodeRef.current;

        if (initialCode) {
          yDoc.transact(() => {
            yText.insert(0, initialCode);
          }, "initialize-code");
          seededInitialCodeRef.current = true;
          notifyRemoteCodeChange(initialCode);
        }
      }

      maybeCreateBinding();
      notifyRemoteCodeChange(yText.toString());
    };

    yDocRef.current = yDoc;
    providerRef.current = provider;
    yTextRef.current = yText;
    seededInitialCodeRef.current = yText.length > 0;

    yText.observe(handleSharedTextUpdate);
    provider.on("sync", handleProviderSync);

    notifyRemoteCodeChange(yText.toString() || starterCodeRef.current);
    maybeCreateBinding();

    return () => {
      yText.unobserve(handleSharedTextUpdate);
      provider.off("sync", handleProviderSync);

      bindingRef.current?.destroy();
      bindingRef.current = null;

      provider.destroy();
      yDoc.destroy();

      yDocRef.current = null;
      yTextRef.current = null;
      providerRef.current = null;
      editorRef.current = null;
      seededInitialCodeRef.current = false;
    };
  }, [maybeCreateBinding, notifyRemoteCodeChange, sessionId]);

  useEffect(() => {
    maybeCreateBinding();
  }, [maybeCreateBinding]);

  useEffect(() => {
    if (yTextRef.current && !seededInitialCodeRef.current) {
      const nextCode = yTextRef.current.toString();

      if (nextCode.length === 0 && starterCodeRef.current) {
        notifyRemoteCodeChange(starterCodeRef.current);
      }
    }
  }, [notifyRemoteCodeChange, starterCode]);

  return {
    handleEditorMount,
  };
};

export default useCollaborativeEditor;