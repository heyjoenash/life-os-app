import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { EmailWidget } from "@/components/widgets/email-widget";
import { TodoWidget } from "@/components/widgets/todo-widget";
import { WidgetContainer } from "@/components/widgets/widget-container";
import { AIPanel } from "@/components/layout/ai-panel";
import { NotesForm } from "@/components/day/notes-form";
import { DailySummary } from "@/components/day/daily-summary";
import { ErrorState, ErrorButton } from "@/components/day/error-state";
import { getDay, updateDay } from "@/lib/api/days";
import { Day } from "@/lib/types/day";
import {
  formatDateForDisplay,
  isValidDateString,
  getTodayDate,
} from "@/lib/utils/date";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Ensure this page is not statically cached and always gets fresh data
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface DayPageProps {
  params: {
    date: string;
  };
}

export const metadata = {
  title: "Day View - Life OS",
  description: "View and manage your daily activities",
};

export default async function DayPage({ params }: DayPageProps) {
  try {
    // Fix for Next.js 15: properly await params - fix the params issue correctly
    const { date } = await Promise.resolve(params);

    console.log("DayPage: Processing date:", date);

    // Validate date format using our utility
    if (!isValidDateString(date)) {
      console.log("DayPage: Invalid date format, redirecting to today");
      const today = getTodayDate();
      return { redirect: { destination: `/day/${today}`, permanent: false } };
    }

    // Format date for display using our utility
    const formattedDate = formatDateForDisplay(date);

    // Fetch or create day record
    console.log("DayPage: Fetching day record for:", date);
    let day: Day | null = null;
    let errorMessage: string | null = null;

    try {
      // First attempt to get existing day
      day = await getDay(date);

      // If no day found, explicitly create one
      if (!day) {
        console.log("DayPage: No day record found, creating one");
        day = await updateDay(date, {});
        console.log("DayPage: Created day record with ID:", day?.id);
      } else {
        console.log("DayPage: Found existing day record with ID:", day.id);
      }
    } catch (error) {
      console.error("DayPage: Error fetching/creating day:", error);
      errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      // Continue without the day data, we'll handle it in the UI
    }

    // Right column content - Notes, Tasks and AI
    const rightColumnContent = (
      <div className="h-full flex flex-col overflow-hidden">
        <Tabs
          defaultValue="notes"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-2 mb-2">
            <TabsTrigger value="notes">Notes & Tasks</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="flex-1 overflow-auto">
            <div className="space-y-6">
              <NotesForm dayId={day?.id} initialValue={day?.daily_note || ""} />
              <TodoWidget dayId={day?.id} />
            </div>
          </TabsContent>

          <TabsContent value="ai" className="flex-1 overflow-hidden">
            <div className="h-full">
              <AIPanel dayId={day?.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );

    // Main center column content
    const centerContent = (
      <>
        {errorMessage && <ErrorState message={errorMessage} />}

        <div className="space-y-6">
          <WidgetContainer title="Daily Summary">
            <DailySummary dayId={day?.id} initialSummary={day?.summary || ""} />
          </WidgetContainer>

          <div className="h-[calc(100vh-400px)] min-h-[500px]">
            <WidgetContainer title="Communication Hub" className="h-full">
              <div className="h-full flex flex-col">
                <div className="space-y-2 mb-4">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-primary-50 text-primary-700 rounded-md text-sm font-medium">
                      All
                    </button>
                    <button className="px-3 py-1 hover:bg-gray-100 rounded-md text-sm">
                      Email
                    </button>
                    <button className="px-3 py-1 hover:bg-gray-100 rounded-md text-sm">
                      Chat
                    </button>
                    <button className="px-3 py-1 hover:bg-gray-100 rounded-md text-sm">
                      Calendar
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <EmailWidget dayId={day?.id} />
                </div>
              </div>
            </WidgetContainer>
          </div>
        </div>
      </>
    );

    return (
      <ThreeColumnLayout
        rightColumnContent={rightColumnContent}
        rightColumnTitle="Daily Workspace"
        centerColumnTitle={formattedDate}
      >
        {centerContent}
      </ThreeColumnLayout>
    );
  } catch (error) {
    console.error("DayPage: Unhandled error:", error);
    return (
      <ThreeColumnLayout>
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "An unexpected error occurred"
          }
          title="Error loading day"
        />
      </ThreeColumnLayout>
    );
  }
}

// Generate static params for improved performance
export function generateStaticParams() {
  return [
    { date: getTodayDate() },
    { date: getTodayDate(-1) }, // yesterday
    { date: getTodayDate(1) }, // tomorrow
  ];
}
