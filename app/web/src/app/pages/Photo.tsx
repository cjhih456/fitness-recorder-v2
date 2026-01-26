import { Button } from '@fitness-recoder/ui';
import { Calendar, Camera, CheckCircle2, Download, Dumbbell } from 'lucide-react';
import { useState } from 'react';

export default function Photo() {
  const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80');

  return (
    <div className="space-y-6 max-w-md mx-auto p-4">
      <h2 className="text-lg font-semibold">운동 인증 사진 만들기</h2>

      <div className="relative aspect-3/4 w-full bg-zinc-200 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800" id="export-card">
        <img src={bgImage} alt="Workout background" className="absolute inset-0 w-full h-full object-cover brightness-75 shadow-inner" />

        <div className="absolute inset-0 p-8 flex flex-col justify-between text-white z-10">
          <div className="flex justify-between items-start">
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 italic">Today's Workout</div>
              <div className="text-2xl font-black tracking-tight leading-none uppercase">PULL DAY</div>
              <div className="text-[10px] font-mono mt-2 flex items-center gap-1">
                <Calendar size={10} /> 2024.05.20 월요일
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Dumbbell size={24} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold opacity-60 mb-1 uppercase tracking-wider">Total Volume</p>
                <p className="text-2xl font-black">4,200<span className="text-sm font-normal ml-1">kg</span></p>
              </div>
              <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold opacity-60 mb-1 uppercase tracking-wider">Duration</p>
                <p className="text-2xl font-black tracking-tighter">01:05:22</p>
              </div>
            </div>

            <div className="bg-blue-600/80 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between border border-blue-400/30">
              <div>
                <p className="text-[10px] font-bold opacity-80 mb-0.5 uppercase tracking-wider">오늘의 최고 기록</p>
                <p className="font-black text-lg">데드리프트 140kg 성공</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 rounded-2xl py-6">
          <Camera size={18} className="mr-2" />
          사진 변경
        </Button>
        <Button variant="default" className="flex-1 rounded-2xl py-6 font-bold">
          <Download size={18} className="mr-2" />
          이미지 저장
        </Button>
      </div>
    </div>
  );
}