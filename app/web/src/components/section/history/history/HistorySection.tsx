import type { HistoryListItem } from './types';
import { useTranslation } from 'react-i18next';
import SectionSkeleton from '../../SectionSkeleton';
import HistoryDayGroup from './HistoryDayGroup';
import HistoryEmpty from './HistoryEmpty';

interface HistorySectionProps {
  year: number;
  month: number;
  finishDates: number[];
  isLoading?: boolean;
  onClickHistory?: (workout: HistoryListItem) => void;
  onClickHome?: () => void;
}

export default function HistorySection({
  year,
  month,
  finishDates,
  isLoading = false,
  onClickHistory,
  onClickHome,
}: HistorySectionProps) {
  const { t } = useTranslation();
  const isEmpty = !isLoading && finishDates.length === 0;

  return (
    <SectionSkeleton title={t('history.title')} useCard={false}>
      {{
        default: (
          <div className="flex flex-col gap-4">
            {isEmpty ? (
              <HistoryEmpty onClickHome={onClickHome} />
            ) : (
              finishDates.map((date) => (
                <HistoryDayGroup
                  key={`${year}-${month}-${date}`}
                  year={year}
                  month={month}
                  date={date}
                  onClickHistory={onClickHistory}
                />
              ))
            )}
          </div>
        ),
      }}
    </SectionSkeleton>
  );
}
