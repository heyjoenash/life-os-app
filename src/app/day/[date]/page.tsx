import { MainLayout } from '@/components/layout/main-layout';
import { EmailWidget } from '@/components/widgets/email-widget';
import { TodoWidget } from '@/components/widgets/todo-widget';
import { WidgetContainer } from '@/components/widgets/widget-container';
import { ChatInterface } from '@/components/ai/chat-interface';
import { NotesForm } from '@/components/day/notes-form';
import { DailySummary } from '@/components/day/daily-summary';
import { ErrorState, ErrorButton } from '@/components/day/error-state';
import { getDay, updateDay } from '@/lib/api/days';
import { Day } from '@/lib/types/day';
import { formatDateForDisplay, isValidDateString, getTodayDate } from '@/lib/utils/date';

// Ensure this page is not statically cached and always gets fresh data
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface DayPageProps {
  params: {
    date: string;
  };
}

export const metadata = {
  title: 'Day View - Life OS',
  description: 'View and manage your daily activities',
};

export default async function DayPage({ params }: DayPageProps) {
  try {
    // Fix for Next.js 15: properly await params - fix the params issue correctly
    const { date } = await Promise.resolve(params);

    console.log('DayPage: Processing date:', date);

    // Validate date format using our utility
    if (!isValidDateString(date)) {
      console.log('DayPage: Invalid date format, redirecting to today');
      const today = getTodayDate();
      return { redirect: { destination: `/day/${today}`, permanent: false } };
    }

    // Format date for display using our utility
    const formattedDate = formatDateForDisplay(date);

    // Fetch or create day record
    console.log('DayPage: Fetching day record for:', date);
    let day: Day | null = null;
    let errorMessage: string | null = null;

    try {
      // First attempt to get existing day
      day = await getDay(date);

      // If no day found, explicitly create one
      if (!day) {
        console.log('DayPage: No day record found, creating one');
        day = await updateDay(date, {});
        console.log('DayPage: Created day record with ID:', day?.id);
      } else {
        console.log('DayPage: Found existing day record with ID:', day.id);
      }
    } catch (error) {
      console.error('DayPage: Error fetching/creating day:', error);
      errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      // Continue without the day data, we'll handle it in the UI
    }

    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{formattedDate}</h1>
            <ErrorButton message={errorMessage} />
          </div>

          <ErrorState message={errorMessage} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <WidgetContainer title="Daily Summary">
                  <DailySummary dayId={day?.id} initialSummary={day?.summary || ''} />
                </WidgetContainer>

                <WidgetContainer title="Notes">
                  <NotesForm dayId={day?.id} initialValue={day?.daily_note || ''} />
                </WidgetContainer>
              </div>

              <EmailWidget dayId={day?.id} />

              <TodoWidget dayId={day?.id} />
            </div>

            <div className="lg:col-span-1">
              <WidgetContainer title="AI Assistant" className="h-[600px] flex flex-col">
                <div className="flex-1 overflow-hidden">
                  <ChatInterface />
                </div>
              </WidgetContainer>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error('DayPage: Unhandled error:', error);
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <ErrorState
            message={error instanceof Error ? error.message : 'An unexpected error occurred'}
            title="Error loading day"
          />
        </div>
      </MainLayout>
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
