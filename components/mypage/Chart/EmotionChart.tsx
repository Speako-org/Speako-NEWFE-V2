import { useState, useEffect } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Image } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { myPageApi, MonthlyStat } from '../../../api/types/statistic';

interface EmotionChartProps {
  onShowInfoModal?: (event: any) => void;
}

const EmotionChart = ({ onShowInfoModal }: EmotionChartProps) => {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await myPageApi.getMyPageInfo();

        if (response.isSuccess && response.result) {
          setMonthlyStats(response.result.monthlyStats);
        } else {
          console.error('마이페이지 데이터 로드 실패:', response.message);
        }
      } catch (error) {
        console.error('데이터 불러오기 실패:', error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    // 초기 화면 크기 설정
    updateDimensions();

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => {
      subscription?.remove();
    };
  }, []);

  // 차트 너비 설정
  const chartWidth = Math.max(screenWidth - 40, 300);
  const safeStats = monthlyStats ?? [];
  const reversedStats = [...safeStats].reverse();

  // 10단위 반올림
  const roundToNearest10 = (num: number) => Math.round(num / 10) * 10;

  const adjustedPositive = reversedStats.map((stat) =>
    roundToNearest10(stat.avgPositiveRatio * 100)
  );

  const adjustedNegative = reversedStats.map((stat) =>
    roundToNearest10(stat.avgNegativeRatio * 100)
  );

  const maxDataValue = 100;

  const dataPositiveWithMax = [...adjustedPositive];
  if (Math.max(...adjustedPositive) < maxDataValue) {
    dataPositiveWithMax.push(maxDataValue);
  }

  const dataNegativeWithMax = [...adjustedNegative];
  if (Math.max(...adjustedNegative) < maxDataValue) {
    dataNegativeWithMax.push(maxDataValue);
  }

  const chartData = {
    labels: [...reversedStats.map((stat) => `${stat.month}월`), ''],
    datasets: [
      {
        data: dataPositiveWithMax,
        color: (opacity = 1) => `rgba(160, 136, 224, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: dataNegativeWithMax,
        color: (opacity = 1) => `rgba(255, 146, 138, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: [],
  };

  reversedStats.forEach((stat, idx) => {
    console.log(
      `월: ${stat.month}월, positive: ${stat.avgPositiveRatio * 100}, negative: ${stat.avgNegativeRatio * 100}`
    );
  });

  return (
    <View className="">
      {/* Header */}
      <View className="mb-[15px] flex-row items-center px-1 pt-6">
        <Text className="mx-[10px] text-[18px] font-bold text-black">언어 습관 그래프</Text>
        <TouchableOpacity onPress={onShowInfoModal}>
          <Image
            source={require('../../../assets/information.png')}
            style={{ width: 16, height: 16 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View className="mb-0 flex-row justify-end">
        <View className=" flex-row items-center">
          <View className="mr-1.5 h-2 w-2 rounded-full bg-[#A088E0]" />
          <Text className="text-[12px] text-gray-500">긍정적 표현</Text>
        </View>
        <View className="mx-2.5 flex-row items-center">
          <View className="mr-1.5 h-2 w-2 rounded-full bg-[#FF928A]" />
          <Text className="text-[12px] text-gray-500">부정적 표현</Text>
        </View>
      </View>

      {/* Chart Box */}
      <View
        className="pb-[10px]"
        style={{
          minHeight: 300,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={250}
          fromZero={true}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 12,
              shadowColor: 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0,
              shadowRadius: 0,
              elevation: 0,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '3',
              stroke: '#fff',
            },
            propsForLabels: {
              fontSize: 14,
            },
            propsForBackgroundLines: {
              strokeDasharray: [],
            },
            backgroundGradientFromOpacity: 0,
            backgroundGradientToOpacity: 0,
            paddingRight: 50,
            paddingTop: 40,
          }}
          formatYLabel={(yValue) => {
            const allowed = [0, 20, 40, 60, 80, 100];
            const num = Number(yValue);
            return allowed.includes(num) ? yValue : '';
          }}
          withHorizontalLines={false}
          withVerticalLines={false}
          withDots={true}
          withShadow={false}
          bezier={false}
          onDataPointClick={() => {}}
          style={{
            marginVertical: 0,
            borderRadius: 12,
            paddingLeft: 15,
          }}
          yAxisSuffix=""
          segments={5}
        />
      </View>
    </View>
  );
};

export default EmotionChart;
