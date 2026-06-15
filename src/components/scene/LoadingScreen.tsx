import { useProgress, Html } from "@react-three/drei";

export function LoadingScreen() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="h-11 w-11 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
        <div className="font-mono text-[13px] tracking-[1px] text-[#e6edf3]">
          LOADING · {Math.round(progress)}%
        </div>
      </div>
    </Html>
  );
}
