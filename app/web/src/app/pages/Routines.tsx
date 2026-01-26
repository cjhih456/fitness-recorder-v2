import RoutineSection from '../../components/section/routines/routines/RoutineSection';

export default function Routines() {
  // TODO: ExercisePresetList 조회 API 연동 후 데이터 바인딩 처리
  return (
    <div className="space-y-6 max-w-md mx-auto p-4">
      <RoutineSection data={[]} />
    </div>
  );
}