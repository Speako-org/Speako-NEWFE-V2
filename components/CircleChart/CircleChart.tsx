import Svg, { Circle } from 'react-native-svg';

interface EmotionCircleChartProps {
  negativeRatio: number; // 0~1 값
  positiveRatio: number; // 0~1 값
  size?: number;
  strokeWidth?: number;
}

const CircleChart: React.FC<EmotionCircleChartProps> = ({
  negativeRatio,
  positiveRatio,
  size = 80,
  strokeWidth = 7,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // 퍼센트 값으로 변환
  const negPercent = Math.round(negativeRatio * 100);
  const posPercent = Math.round(positiveRatio * 100);

  // 총합 보정 (100% 넘지 않도록)
  const totalPercent = negPercent + posPercent;
  const adjustedNeg = totalPercent > 100 ? (negPercent / totalPercent) * 100 : negPercent;
  const adjustedPos = totalPercent > 100 ? (posPercent / totalPercent) * 100 : posPercent;

  // 원 둘레에 해당하는 길이
  const negLength = (adjustedNeg / 100) * circumference;
  const posLength = (adjustedPos / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      {/* 기본 회색 배경 */}
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke="#e2e2e2"
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* 긍정 (파란색, 먼저 그리기) */}
      {adjustedPos > 0 && (
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#8ab5fa"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${posLength} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${center} ${center})`}
          strokeLinecap="butt"
        />
      )}

      {/* 부정 (빨간색, 긍정 위에 이어서 그림) */}
      {adjustedNeg > 0 && (
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#ff8f89"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${negLength} ${circumference}`}
          strokeDashoffset={-posLength} // 긍정 길이만큼 이동시켜 이어 그리기
          transform={`rotate(-90 ${center} ${center})`}
          strokeLinecap="butt"
        />
      )}
    </Svg>
  );
};

export default CircleChart;
