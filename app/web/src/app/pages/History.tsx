import HistorySection from '../../components/section/history/history/HistorySection';

export default function History() {
  // TODO: Schedule History 조회 API 연동 후 데이터 바인딩 처리
  return (
    <div className="space-y-4 max-w-md mx-auto p-4">
      <HistorySection data={[]} />
    </div>
  );
}