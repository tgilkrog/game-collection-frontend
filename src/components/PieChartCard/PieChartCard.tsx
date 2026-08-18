import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { chartColorAt } from '../../utils/chartColors';
import styles from './PieChartCard.module.css';

type PieChartRow = { label: string; count: number; meta?: string };

type Props = {
  title: string;
  data: PieChartRow[];
};

function ChartTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload as PieChartRow;
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltip_label}>{row.label}</span>
      <span className={styles.tooltip_count}>{row.count}</span>
    </div>
  );
}

export function PieChartCard({ title, data }: Props) {
  if (data.length === 0) return null;

  return (
    <div className={styles.card}>
      <div className={styles.heading}>{title}</div>

      <div className={styles.chart_wrap}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius="50%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((row, i) => (
                <Cell key={row.label} fill={chartColorAt(i)} />
              ))}
            </Pie>
            <Tooltip content={ChartTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.legend}>
        {data.map((row, i) => (
          <div key={row.label} className={styles.legend_row}>
            <span className={styles.swatch} style={{ backgroundColor: chartColorAt(i) }} />
            <span className={styles.legend_label}>{row.label}</span>
            <span className={styles.legend_count}>{row.count}</span>
            {row.meta && <span className={styles.legend_meta}>{row.meta}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
