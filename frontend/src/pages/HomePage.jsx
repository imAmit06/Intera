import React, { useState } from "react";
import { Link } from "react-router";
import {
  CodeXml,
  Video,
  ArrowRight,
  Zap,
  Check,
  Users,
  TrendingUp,
} from "lucide-react";
import { SignInButton } from "@clerk/react";
import CodeEditor from "../components/CodeEditorPanel";
import { HOME_PAGE_CODE_SNIPPET } from "../data/problems";

const HomePage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(HOME_PAGE_CODE_SNIPPET.javascript);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(HOME_PAGE_CODE_SNIPPET[newLang]);
    setOutput(null);
  };
  return (
    <div className="bg-linear-to-br from-base-100 via-base-200 to-base-300">
      {/* NAVBAR */}
      <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between ">
          {/* LOGO */}
          <Link
            to={"/"}
            className="flex items-center gap-3 hover:scale-105 transition-transform duration-200"
          >
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <CodeXml className="size-6 text-white" />
            </div>

            <div className="flex flex-col">
              <span className="font-black text-xl bg-primary-content bg-clip-text text-transparent font-mono tracking-wider">
                Intera
              </span>
              <span className="text-xs text-base-content/60 font-medium -mt-1">
                Code. Collaborate. Evaluate.
              </span>
            </div>
          </Link>
          {/* AUTH BTN */}
          <SignInButton mode="modal">
            <button className="group px-6 py-3 bg-primary rounded-xl text-primary-content font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2">
              <span>Get started</span>
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </SignInButton>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-9">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div className="space-y-7">
            <div className="badge badge-primary badge-xl">
              <Zap className="size-4" />
              Real-time Collaboration
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              <span className="bg-primary bg-clip-text text-transparent">
                Ditch the
              </span>
              <br />
              <span className="text-base-content">Google Doc.</span>
            </h1>
            <p className="text-xl text-base-content/70 leading-relaxed max-w-xl">
              Intera is a real coding environment for real technical interviews
              - video, editor, and test cases in one room.
            </p>

            {/* FEATURE PILLS */}
            <div className="flex flex-wrap gap-3">
              <div className="badge badge-lg badge-outline">
                <Check className="size-4 text-success" />
                Live Video Chat
              </div>
              <div className="badge badge-lg badge-outline">
                <Check className="size-4 text-success" />
                Code Editor
              </div>
              <div className="badge badge-lg badge-outline">
                <Check className="size-4 text-success" />
                Multi-Language
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <SignInButton mode="modal">
                <button className="btn btn-primary btn-lg">
                  Start Coding Now
                  <ArrowRight className="size-5" />
                </button>
              </SignInButton>

              <button className="btn btn-outline btn-lg">
                <Video className="size-5" />
                Watch Demo
              </button>
            </div>

            {/* STATS */}
            <div className="stats stats-vertical lg:stats-horizontal bg-base-100 shadow-lg">
              <div className="stat">
                <div className="stat-value text-neutral-content">10K+</div>
                <div className="stat-title flex items-center gap-2">
                  <TrendingUp className="size-4 text-success" />
                  Active User
                </div>
              </div>
              <div className="stat">
                <div className="stat-value text-neutral-content">50K+</div>
                <div className="stat-title flex items-center gap-2">
                  <TrendingUp className="size-4 text-success" />
                  Sessions
                </div>
              </div>
              <div className="stat">
                <div className="stat-value text-neutral-content ">98.9%</div>
                <div className="stat-title flex items-center gap-2">
                  <TrendingUp className="size-4 text-success" />
                  Uptime
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <CodeEditor
            selectedLanguage={selectedLanguage}
            code={code}
            isRunning={false}
            onLanguageChange={handleLanguageChange}
            onCodeChange={setCode}
            onRunCode={() => {}}
          />
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-9">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything you need to <span className="text-primary">Succeed</span>
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Powerful features to help you excel in technical interviews
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* FEATURE 1 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Video className="size-8 text-primary" />
              </div>
              <h3 className="card-title">HD Video Call</h3>
              <p className="text-base-content/70">
                Crystal clear video and audio for seamless communication during
                interviews
              </p>
            </div>
          </div>
          {/* FEATURE 2 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <CodeXml className="size-8 text-primary" />
              </div>
              <h3 className="card-title">Live Code Editor</h3>
              <p className="text-base-content/70">
                Collaborate in real-time with syntax highlighting and multiple
                language support
              </p>
            </div>
          </div>
          {/* FEATURE 3 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Users className="size-8 text-primary" />
              </div>
              <h3 className="card-title">Easy Collaboration</h3>
              <p className="text-base-content/70">
                Share your screen, discuss solution and learn from each other in
                real-time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
