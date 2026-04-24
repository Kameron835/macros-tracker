'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

type MacroPieChartProps = {
  protein: number
  carbs: number
  fat: number
}

export default function MacroPieChart({
  protein,
  carbs,
  fat,
}: MacroPieChartProps) {
  const data = [
    { name: 'Protein', value: protein },
    { name: 'Carbs', value: carbs },
    { name: 'Fat', value: fat },
  ].filter((item) => item.value > 0)

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-2xl font-semibold text-white">Macro breakdown</h2>
      <p className="mt-2 text-sm text-neutral-400">
        Visual breakdown of the selected day&apos;s consumed macros.
      </p>

      {data.length === 0 ? (
        <p className="mt-6 text-neutral-400">Add foods to see the chart.</p>
      ) : (
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}g`}
              >
                <Cell fill="#10b981" />
                <Cell fill="#34d399" />
                <Cell fill="#6ee7b7" />
              </Pie>
              <Tooltip
              formatter={(value) => {
                const numericValue = Number(value ?? 0)
                return `${numericValue.toFixed(1)} g`
                 }}
                 />
              
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}