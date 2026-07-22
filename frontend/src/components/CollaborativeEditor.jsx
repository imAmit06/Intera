import CodeEditorPanel from "./CodeEditorPanel.jsx";
import useCollaborativeEditor from "../hooks/useCollaborativeEditor.js";

const CollaborativeEditor = ({
  sessionId,
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  starterCode,
}) => {
  const { handleEditorMount } = useCollaborativeEditor({
    sessionId,
    starterCode,
    onRemoteCodeChange: onCodeChange,
  });

  return (
    <CodeEditorPanel
      selectedLanguage={selectedLanguage}
      code={code}
      isRunning={isRunning}
      onLanguageChange={onLanguageChange}
      onCodeChange={onCodeChange}
      onRunCode={onRunCode}
      onEditorMount={handleEditorMount}
    />
  );
};

export default CollaborativeEditor;