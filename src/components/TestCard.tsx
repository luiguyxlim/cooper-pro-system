'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Target, Trash2, Eye } from 'lucide-react'
import { PerformanceTest } from '@/lib/types'
import { deleteTest } from '@/lib/actions/tests'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface TestCardProps {
  test: PerformanceTest
  onDelete?: () => void
  showStudentName?: boolean
}

export function TestCard({ test, onDelete, showStudentName = false }: TestCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este teste?')) {
      return
    }

    setIsLoading(true)
    try {
      await deleteTest(test.id)
      toast.success('Teste excluído com sucesso')
      onDelete?.()
    } catch (error) {
      toast.error('Erro ao excluir teste')
      console.error('Error deleting test:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = () => {
    router.push(`/tests/${test.id}`)
  }

  const getTestTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cooper':
        return 'bg-blue-100 text-blue-800'
      case 'vo2_max':
        return 'bg-green-100 text-green-800'
      case 'flexibility':
        return 'bg-purple-100 text-purple-800'
      case 'strength':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTestType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cooper':
        return 'Teste de Cooper'
      case 'vo2_max':
        return 'VO2 Máximo'
      case 'flexibility':
        return 'Flexibilidade'
      case 'strength':
        return 'Força'
      default:
        return type
    }
  }

  const calculateAverageScore = () => {
    const scores = []
    if (test.cooper_distance) scores.push(test.cooper_distance)
    if (test.vo2_max) scores.push(test.vo2_max)
    if (test.flexibility_score) scores.push(test.flexibility_score)
    if (test.strength_score) scores.push(test.strength_score)
    
    if (scores.length === 0) return null
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
  }

  const getMetricsCount = () => {
    let count = 0
    if (test.cooper_distance) count++
    if (test.vo2_max) count++
    if (test.flexibility_score) count++
    if (test.strength_score) count++
    return count
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {formatTestType(test.test_type)}
            </CardTitle>
            {showStudentName && test.student && (
              <p className="text-sm text-gray-600 mt-1">
                {test.student.name}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getTestTypeColor(test.test_type)}>
                {test.test_type.toUpperCase()}
              </Badge>
              {calculateAverageScore() && (
                <Badge variant="outline">
                  Média: {calculateAverageScore()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{new Date(test.test_date).toLocaleDateString('pt-BR')}</span>
        </div>
        
        {test.duration && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{test.duration} minutos</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Target className="h-4 w-4" />
          <span>{getMetricsCount()} métrica(s) registrada(s)</span>
        </div>
        
        {/* Métricas específicas */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {test.cooper_distance && (
            <div className="bg-blue-50 p-2 rounded">
              <span className="font-medium text-blue-700">Cooper:</span>
              <span className="ml-1">{test.cooper_distance}m</span>
            </div>
          )}
          
          {test.vo2_max && (
            <div className="bg-green-50 p-2 rounded">
              <span className="font-medium text-green-700">VO2 Max:</span>
              <span className="ml-1">{test.vo2_max}</span>
            </div>
          )}
          
          {test.flexibility_score && (
            <div className="bg-purple-50 p-2 rounded">
              <span className="font-medium text-purple-700">Flexibilidade:</span>
              <span className="ml-1">{test.flexibility_score}</span>
            </div>
          )}
          
          {test.strength_score && (
            <div className="bg-red-50 p-2 rounded">
              <span className="font-medium text-red-700">Força:</span>
              <span className="ml-1">{test.strength_score}</span>
            </div>
          )}
        </div>
        
        {test.observations && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <span className="font-medium">Observações:</span>
            <p className="mt-1">{test.observations}</p>
          </div>
        )}
        
        <div className="flex gap-2 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver Detalhes
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}