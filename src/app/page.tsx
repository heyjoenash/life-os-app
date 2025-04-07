import Link from "next/link";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import {
  ArrowRight,
  LayoutDashboard,
  Calendar,
  Mail,
  MessageCircle,
  Users,
  FileText,
} from "lucide-react";
import { getTodayDate } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { AIPanel } from "@/components/layout/ai-panel";

export const metadata = {
  title: "Life OS - Your Personal Productivity Dashboard",
  description: "Organize your digital life with Life OS",
};

export default function HomePage() {
  const today = getTodayDate();

  const rightColumnContent = (
    <div className="h-full">
      <AIPanel />
    </div>
  );

  return (
    <ThreeColumnLayout
      rightColumnContent={rightColumnContent}
      rightColumnTitle="AI Assistant"
      centerColumnTitle="Welcome to Life OS"
    >
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Your Personal Productivity Hub
          </h2>
          <p className="text-gray-600 mb-6">
            Life OS is your all-in-one platform for organizing your digital
            life. Manage tasks, emails, notes, and more with the help of AI to
            boost your productivity.
          </p>

          <div className="flex flex-wrap gap-2">
            <Link href={`/day/${today}`}>
              <Button className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Go to Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/inbox">
              <Button variant="outline" className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                View Messages
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Dashboard Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex hover:border-primary-300 hover:shadow transition-all">
            <div className="mr-4">
              <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                <LayoutDashboard className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Dashboard</h3>
              <p className="text-sm text-gray-500">
                Get an overview of your day, tasks, and emails
              </p>
            </div>
          </div>

          {/* Daily View Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex hover:border-primary-300 hover:shadow transition-all">
            <div className="mr-4">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Daily View</h3>
              <p className="text-sm text-gray-500">
                Organize tasks and notes for specific days
              </p>
            </div>
          </div>

          {/* Messages Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex hover:border-primary-300 hover:shadow transition-all">
            <div className="mr-4">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <MessageCircle className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Messages</h3>
              <p className="text-sm text-gray-500">
                All your communications in one unified inbox
              </p>
            </div>
          </div>

          {/* Contacts Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex hover:border-primary-300 hover:shadow transition-all">
            <div className="mr-4">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Contacts</h3>
              <p className="text-sm text-gray-500">
                Manage and organize your business connections
              </p>
            </div>
          </div>

          {/* Documents Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex hover:border-primary-300 hover:shadow transition-all">
            <div className="mr-4">
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Documents</h3>
              <p className="text-sm text-gray-500">
                Store and organize all your important files
              </p>
            </div>
          </div>

          {/* AI Assistant Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex hover:border-primary-300 hover:shadow transition-all">
            <div className="mr-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 3H15M12 9V21M7 6H17L20 12L17 18H7L4 12L7 6Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">AI Assistant</h3>
              <p className="text-sm text-gray-500">
                Get help with tasks, summaries, and insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </ThreeColumnLayout>
  );
}
