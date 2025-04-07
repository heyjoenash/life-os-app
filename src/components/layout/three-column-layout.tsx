"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import {
  ChevronLeft,
  ChevronRight,
  X,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { usePathname } from "next/navigation";

interface ThreeColumnLayoutProps {
  children: ReactNode;
  rightColumnContent?: ReactNode;
  rightColumnTitle?: string;
  centerColumnTitle?: string;
  showRightColumnOnMobile?: boolean;
}

export function ThreeColumnLayout({
  children,
  rightColumnContent,
  rightColumnTitle = "Daily Notes",
  centerColumnTitle,
  showRightColumnOnMobile = false,
}: ThreeColumnLayoutProps) {
  const [isRightColumnCollapsed, setIsRightColumnCollapsed] = useState(false);
  const [isLeftColumnCollapsed, setIsLeftColumnCollapsed] = useState(false);
  const [isRightColumnVisible, setIsRightColumnVisible] = useState(
    showRightColumnOnMobile
  );
  const pathname = usePathname();

  const toggleRightColumn = () => {
    setIsRightColumnCollapsed(!isRightColumnCollapsed);
  };

  const toggleLeftColumn = () => {
    setIsLeftColumnCollapsed(!isLeftColumnCollapsed);
  };

  const toggleRightColumnMobile = () => {
    setIsRightColumnVisible(!isRightColumnVisible);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Column - Navigation */}
      <div
        className={cn(
          "h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-20",
          isLeftColumnCollapsed ? "w-16" : "w-64",
          "hidden md:block"
        )}
      >
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLeftColumn}
            className="h-8 w-8 p-0"
          >
            {isLeftColumnCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </Button>
        </div>

        <Sidebar isCollapsed={isLeftColumnCollapsed} />
      </div>

      {/* Center Column - Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header />

        <div className="flex flex-1 overflow-hidden relative">
          {/* Main Content Area */}
          <div
            className={cn(
              "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
              isRightColumnVisible ? "hidden md:flex" : "flex"
            )}
          >
            {centerColumnTitle && (
              <div className="px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
                <h2 className="text-lg font-medium text-gray-800">
                  {centerColumnTitle}
                </h2>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
          </div>

          {/* Right Column - Notes & Utilities */}
          <div
            className={cn(
              "border-l border-gray-200 bg-white overflow-y-auto transition-all duration-300 ease-in-out",
              isRightColumnCollapsed
                ? "w-0 md:w-0 opacity-0 invisible md:invisible"
                : "w-full md:w-96 opacity-100 visible",
              isRightColumnVisible
                ? "fixed inset-0 z-30 md:relative md:z-0"
                : "hidden md:block"
            )}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
                <h2 className="text-lg font-medium text-gray-800">
                  {rightColumnTitle}
                </h2>
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleRightColumnMobile}
                    className="h-8 w-8 p-0 md:hidden"
                  >
                    <X size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleRightColumn}
                    className="h-8 w-8 p-0 hidden md:flex"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {rightColumnContent}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile toggle for right column */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleRightColumnMobile}
          className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0 md:hidden shadow-lg bg-white z-10"
        >
          <PanelRight size={20} />
        </Button>
      </div>
    </div>
  );
}
