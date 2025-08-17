import { ComponentTemplate } from '@/types/database'

// ===== CHART COMPONENTS =====

export const BAR_CHART_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface BarChartData {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarChartData[]
  height?: number
  maxValue?: number
  showLabels?: boolean
  showValues?: boolean
  orientation?: 'vertical' | 'horizontal'
  variant?: 'default' | 'rounded' | 'gradient'
  className?: string
}

const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  ({ 
    data, 
    height = 300,
    maxValue,
    showLabels = true,
    showValues = false,
    orientation = 'vertical',
    variant = 'default',
    className,
    ...props 
  }, ref) => {
    const max = maxValue || Math.max(...data.map(item => item.value))
    const colors = [
      'hsl(var(--color-primary-500))',
      'hsl(var(--color-secondary-500))',
      '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
    ]

    const getBarStyle = (value: number, index: number) => {
      const percentage = (value / max) * 100
      const color = data[index].color || colors[index % colors.length]
      
      if (orientation === 'horizontal') {
        return {
          width: \`\${percentage}%\`,
          backgroundColor: variant === 'gradient' 
            ? \`linear-gradient(90deg, \${color}88, \${color})\`
            : color
        }
      } else {
        return {
          height: \`\${percentage}%\`,
          backgroundColor: variant === 'gradient' 
            ? \`linear-gradient(180deg, \${color}, \${color}88)\`
            : color
        }
      }
    }

    const barClasses = cn(
      'transition-all duration-300 hover:opacity-80',
      variant === 'rounded' && 'rounded-t',
      orientation === 'horizontal' && variant === 'rounded' && 'rounded-r'
    )

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        style={{ height }}
        {...props}
      >
        <div className={cn(
          'h-full flex items-end justify-center',
          orientation === 'horizontal' && 'flex-col items-start'
        )}>
          {data.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                'flex flex-col items-center mx-1',
                orientation === 'horizontal' && 'flex-row my-1 mx-0 w-full'
              )}
            >
              {showLabels && orientation === 'vertical' && (
                <div className="text-xs text-[hsl(var(--color-secondary-600))] mb-2 text-center max-w-16 truncate">
                  {item.label}
                </div>
              )}
              
              <div className={cn(
                'relative group',
                orientation === 'vertical' ? 'h-full min-w-8 flex items-end' : 'w-full h-6 flex items-center'
              )}>
                <div
                  className={barClasses}
                  style={getBarStyle(item.value, index)}
                >
                  {showValues && (
                    <div className={cn(
                      'absolute text-xs font-medium text-white',
                      'opacity-0 group-hover:opacity-100 transition-opacity',
                      orientation === 'vertical' 
                        ? 'top-1 left-1/2 -translate-x-1/2' 
                        : 'right-1 top-1/2 -translate-y-1/2'
                    )}>
                      {item.value}
                    </div>
                  )}
                </div>
                
                {/* Tooltip */}
                <div className={cn(
                  'absolute z-10 px-2 py-1 bg-gray-800 text-white text-xs rounded',
                  'opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
                  orientation === 'vertical' 
                    ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
                    : 'left-full top-1/2 -translate-y-1/2 ml-2'
                )}>
                  {item.label}: {item.value}
                </div>
              </div>

              {showLabels && orientation === 'horizontal' && (
                <div className="text-xs text-[hsl(var(--color-secondary-600))] ml-2 truncate flex-shrink-0 w-16">
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }
)

BarChart.displayName = 'BarChart'

export default BarChart`

export const LINE_CHART_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface LineChartData {
  x: number | string
  y: number
}

interface LineChartProps {
  data: LineChartData[]
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
  showDots?: boolean
  showGrid?: boolean
  smooth?: boolean
  className?: string
}

const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
  ({ 
    data, 
    width = 400,
    height = 200,
    color = 'hsl(var(--color-primary-500))',
    strokeWidth = 2,
    showDots = true,
    showGrid = true,
    smooth = false,
    className,
    ...props 
  }, ref) => {
    const padding = 20
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    const maxY = Math.max(...data.map(d => d.y))
    const minY = Math.min(...data.map(d => d.y))
    const maxX = data.length - 1

    const getX = (index: number) => padding + (index / maxX) * chartWidth
    const getY = (value: number) => padding + (1 - (value - minY) / (maxY - minY)) * chartHeight

    const points = data.map((d, i) => ({ x: getX(i), y: getY(d.y) }))

    const pathD = smooth
      ? generateSmoothPath(points)
      : \`M \${points.map(p => \`\${p.x},\${p.y}\`).join(' L ')}\`

    return (
      <div
        ref={ref}
        className={cn('inline-block', className)}
        {...props}
      >
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid */}
          {showGrid && (
            <g className="opacity-20">
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                <line
                  key={ratio}
                  x1={padding}
                  y1={padding + ratio * chartHeight}
                  x2={padding + chartWidth}
                  y2={padding + ratio * chartHeight}
                  stroke="hsl(var(--color-secondary-400))"
                  strokeWidth={1}
                />
              ))}
              {/* Vertical grid lines */}
              {data.map((_, i) => (
                <line
                  key={i}
                  x1={getX(i)}
                  y1={padding}
                  x2={getX(i)}
                  y2={padding + chartHeight}
                  stroke="hsl(var(--color-secondary-400))"
                  strokeWidth={1}
                />
              ))}
            </g>
          )}

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            className="drop-shadow-sm"
          />

          {/* Dots */}
          {showDots && points.map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r={4}
                fill="white"
                stroke={color}
                strokeWidth={2}
                className="drop-shadow-sm hover:r-6 transition-all cursor-pointer"
              />
              {/* Tooltip */}
              <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <rect
                  x={point.x - 20}
                  y={point.y - 30}
                  width={40}
                  height={20}
                  fill="rgba(0,0,0,0.8)"
                  rx={4}
                />
                <text
                  x={point.x}
                  y={point.y - 15}
                  textAnchor="middle"
                  fill="white"
                  fontSize={12}
                >
                  {data[i].y}
                </text>
              </g>
            </g>
          ))}

          {/* Axis labels */}
          <g className="text-xs fill-[hsl(var(--color-secondary-600))]">
            {/* Y-axis labels */}
            {[minY, (minY + maxY) / 2, maxY].map((value, i) => (
              <text
                key={value}
                x={padding - 10}
                y={padding + i * (chartHeight / 2) + 4}
                textAnchor="end"
              >
                {Math.round(value)}
              </text>
            ))}
            
            {/* X-axis labels */}
            {data.map((d, i) => (
              <text
                key={i}
                x={getX(i)}
                y={height - 5}
                textAnchor="middle"
              >
                {d.x}
              </text>
            ))}
          </g>
        </svg>
      </div>
    )
  }
)

// Helper function for smooth curves
function generateSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return ''
  
  let path = \`M \${points[0].x},\${points[0].y}\`
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]
    
    if (i === 1) {
      const cp1x = prev.x + (curr.x - prev.x) / 3
      const cp1y = prev.y
      const cp2x = curr.x - (next ? (next.x - prev.x) / 6 : (curr.x - prev.x) / 3)
      const cp2y = curr.y
      path += \` C \${cp1x},\${cp1y} \${cp2x},\${cp2y} \${curr.x},\${curr.y}\`
    } else if (i === points.length - 1) {
      const cp1x = prev.x + (curr.x - points[i - 2].x) / 6
      const cp1y = prev.y
      const cp2x = curr.x - (curr.x - prev.x) / 3
      const cp2y = curr.y
      path += \` C \${cp1x},\${cp1y} \${cp2x},\${cp2y} \${curr.x},\${curr.y}\`
    } else {
      const cp1x = prev.x + (curr.x - points[i - 2].x) / 6
      const cp1y = prev.y
      const cp2x = curr.x - (next.x - prev.x) / 6
      const cp2y = curr.y
      path += \` C \${cp1x},\${cp1y} \${cp2x},\${cp2y} \${curr.x},\${curr.y}\`
    }
  }
  
  return path
}

LineChart.displayName = 'LineChart'

export default LineChart`

export const PIE_CHART_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface PieChartData {
  label: string
  value: number
  color?: string
}

interface PieChartProps {
  data: PieChartData[]
  size?: number
  innerRadius?: number
  showLabels?: boolean
  showLegend?: boolean
  showValues?: boolean
  className?: string
}

const PieChart = React.forwardRef<HTMLDivElement, PieChartProps>(
  ({ 
    data, 
    size = 200,
    innerRadius = 0,
    showLabels = true,
    showLegend = true,
    showValues = false,
    className,
    ...props 
  }, ref) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const center = size / 2
    const radius = size / 2 - 10
    
    const colors = [
      'hsl(var(--color-primary-500))',
      'hsl(var(--color-secondary-500))',
      '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'
    ]

    let currentAngle = 0
    const segments = data.map((item, index) => {
      const percentage = item.value / total
      const angle = percentage * 2 * Math.PI
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      
      currentAngle += angle

      const x1 = center + radius * Math.cos(startAngle)
      const y1 = center + radius * Math.sin(startAngle)
      const x2 = center + radius * Math.cos(endAngle)
      const y2 = center + radius * Math.sin(endAngle)

      const largeArcFlag = angle > Math.PI ? 1 : 0

      const pathData = [
        \`M \${center} \${center}\`,
        \`L \${x1} \${y1}\`,
        \`A \${radius} \${radius} 0 \${largeArcFlag} 1 \${x2} \${y2}\`,
        'Z'
      ].join(' ')

      // For donut chart
      const donutPathData = innerRadius > 0 ? [
        \`M \${center + innerRadius * Math.cos(startAngle)} \${center + innerRadius * Math.sin(startAngle)}\`,
        \`A \${innerRadius} \${innerRadius} 0 \${largeArcFlag} 1 \${center + innerRadius * Math.cos(endAngle)} \${center + innerRadius * Math.sin(endAngle)}\`,
        \`L \${x2} \${y2}\`,
        \`A \${radius} \${radius} 0 \${largeArcFlag} 0 \${x1} \${y1}\`,
        'Z'
      ].join(' ') : pathData

      // Label position
      const labelAngle = startAngle + angle / 2
      const labelRadius = radius * 0.7
      const labelX = center + labelRadius * Math.cos(labelAngle)
      const labelY = center + labelRadius * Math.sin(labelAngle)

      return {
        ...item,
        pathData: donutPathData,
        percentage: Math.round(percentage * 100),
        color: item.color || colors[index % colors.length],
        labelX,
        labelY,
        labelAngle
      }
    })

    return (
      <div
        ref={ref}
        className={cn('flex items-center space-x-6', className)}
        {...props}
      >
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {segments.map((segment, index) => (
              <g key={segment.label}>
                <path
                  d={segment.pathData}
                  fill={segment.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer drop-shadow-sm"
                  stroke="white"
                  strokeWidth={2}
                />
              </g>
            ))}
          </svg>

          {/* Center content for donut charts */}
          {innerRadius > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-[hsl(var(--color-secondary-900))]">
                  {total}
                </div>
                <div className="text-sm text-[hsl(var(--color-secondary-500))]">
                  Total
                </div>
              </div>
            </div>
          )}

          {/* Labels on chart */}
          {showLabels && (
            <svg width={size} height={size} className="absolute inset-0">
              {segments.map((segment) => (
                <g key={segment.label}>
                  <text
                    x={segment.labelX}
                    y={segment.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium fill-white drop-shadow-sm"
                  >
                    {segment.percentage}%
                  </text>
                  {showValues && (
                    <text
                      x={segment.labelX}
                      y={segment.labelY + 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-white drop-shadow-sm"
                    >
                      {segment.value}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          )}
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="space-y-2">
            {segments.map((segment) => (
              <div key={segment.label} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm text-[hsl(var(--color-secondary-700))]">
                  {segment.label}
                </span>
                <span className="text-sm font-medium text-[hsl(var(--color-secondary-900))]">
                  {segment.percentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

PieChart.displayName = 'PieChart'

export default PieChart`

// 차트 컴포넌트 템플릿 배열
export const chartComponentTemplates: ComponentTemplate[] = [
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    category: 'optional',
    template_code: BAR_CHART_TEMPLATE,
    props_schema: {
      orientation: {
        type: 'string',
        required: false,
        default: 'vertical',
        options: ['vertical', 'horizontal'],
        description: 'Chart orientation'
      },
      variant: {
        type: 'string',
        required: false,
        default: 'default',
        options: ['default', 'rounded', 'gradient'],
        description: 'Bar visual style'
      },
      showValues: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Show values on bars'
      }
    },
    description: 'Customizable bar chart with multiple variants',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'line-chart',
    name: 'Line Chart',
    category: 'optional',
    template_code: LINE_CHART_TEMPLATE,
    props_schema: {
      smooth: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Use smooth curves'
      },
      showDots: {
        type: 'boolean',
        required: false,
        default: true,
        description: 'Show data points'
      },
      showGrid: {
        type: 'boolean',
        required: false,
        default: true,
        description: 'Show grid lines'
      }
    },
    description: 'Line chart with smooth curves and interactive dots',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart',
    category: 'optional',
    template_code: PIE_CHART_TEMPLATE,
    props_schema: {
      innerRadius: {
        type: 'number',
        required: false,
        default: 0,
        description: 'Inner radius for donut chart'
      },
      showLegend: {
        type: 'boolean',
        required: false,
        default: true,
        description: 'Show legend'
      },
      showLabels: {
        type: 'boolean',
        required: false,
        default: true,
        description: 'Show percentage labels'
      }
    },
    description: 'Pie/donut chart with legend and interactive segments',
    is_active: true,
    created_at: new Date().toISOString()
  }
]`