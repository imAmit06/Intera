import CodeEditorPanel from "./CodeEditorPanel.jsx";
import useCollaborativeEditor from "../hooks/useCollaborativeEditor.js";

const CollaborativeEditor = ({
  sessionId,
  isRunning,
  onRunCode,
  onLanguageChange,
  starterCode,
  defaultLanguage = "javascript",
  userName,
  isHost,
}) => {
  const { handleEditorMount, language, setSharedLanguage, getCurrentCode } =
    useCollaborativeEditor({
      sessionId,
      starterCode,
      defaultLanguage,
      onLanguageChange,
      userName,
      isHost,
    });

  const handleLanguageSelect = (e) => {
    setSharedLanguage(e.target.value);
  };

  const handleRunCode = () => {
    onRunCode?.(getCurrentCode());
  };

  return (
    <CodeEditorPanel
      selectedLanguage={language}
      isRunning={isRunning}
      onLanguageChange={handleLanguageSelect}
      onRunCode={onRunCode ? handleRunCode : null}
      onEditorMount={handleEditorMount}
      isCollaborative
    />
  );
};

export default CollaborativeEditor;
