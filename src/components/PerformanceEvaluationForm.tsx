'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calculator, User, Target, Clock, Zap, Gauge, Flame, Scale } from 'lucide-react'
import { Student, PerformanceTest } from '@/lib/types'
import { getStudents } from '@/lib/actions/students'
import { getTestsByStudent } from '@/lib/actions/tests'
import { createPerformanceEvaluation } from '@/lib/actions/performance-evaluation'
import { calculatePerformanceEvaluation } from '@/lib/utils/performance-evaluation'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function PerformanceEvaluationForm() {
  const [students, setStudents] = useState<Student[]>([])
  const [tests, setTests] = useState<PerformanceTest[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedTest, setSelectedTest] = useState<PerformanceTest | null>(null)
  const [intensityPercentage, setIntensityPercentage] = useState('')
  const [trainingTime, setTrainingTime] = useState('')
  const [testDate, setTestDate] = useState('')
  const [observations, setObservations] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [isLoadingTests, setIsLoadingTests] = useState(false)
  const [calculatedMetrics, setCalculatedMetrics] = useState<any>(null)
  
  const router = useRouter()

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    if (selectedStudent) {
      loadTestsForStudent(selectedStudent.id)
    } else {
      setTests([])
      setSelectedTest(null)
    }
  }, [selectedStudent])

  useEffect(() => {
    if (selectedTest && intensityPercentage && trainingTime && selectedStudent) {
      calculateMetrics()
    } else {
      setCalculatedMetrics(null)
    }
  }, [selectedTest, intensityPercentage, trainingTime, selectedStudent])

  const loadStudents = async () => {
    try {
      const studentsData = await getStudents()
      setStudents(studentsData.filter(student => student.is_active))
    } catch (error) {
      toast.error('Erro ao carregar estudantes')
      console.error('Error loading students:', error)
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const loadTestsForStudent = async (studentId: string) => {
    setIsLoadingTests(true)
    try {
      const testsData = await getTestsByStudent(studentId)
      // Filtrar apenas testes de Cooper que tenham distância registrada
      const cooperTests = testsData.filter(
        test => test.test_type.toLowerCase() === 'cooper' && test.cooper_distance
      )
      setTests(cooperTests)
      setSelectedTest(null)
    } catch (error) {
      toast.error('Erro ao carregar testes do estudante')
      console.error('Error loading tests:', error)
    } finally {
      setIsLoadingTests(false)
    }
  }

  const calculateMetrics = () => {
    if (!selectedTest || !intensityPercentage || !trainingTime || !selectedStudent) {
      return
    }

    const cooperDistance = selectedTest.cooper_distance || 0
    const intensity = parseFloat(intensityPercentage)
    const time = parseFloat(trainingTime)
    const weight = selectedStudent.weight || 70 // peso padrão se não informado

    if (cooperDistance > 0 && intensity > 0 && time > 0) {
      const metrics = calculatePerformanceEvaluation(
        cooperDistance,
        intensity,
        time,
        weight
      )
      setCalculatedMetrics(metrics)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStudent || !selectedTest || !intensityPercentage || !trainingTime || !testDate) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (!calculatedMetrics) {
      toast.error('Erro no cálculo das métricas')
      return
    }

    setIsLoading(true)
    try {
      await createPerformanceEvaluation({
        student_id: selectedStudent.id,
        test_id: selectedTest.id,
        intensity_percentage: parseFloat(intensityPercentage),
        training_time: parseFloat(trainingTime),
        test_date: testDate,
        observations,
        vo2_max: calculatedMetrics.vo2Max,
        training_distance: calculatedMetrics.trainingDistance,
        training_intensity: calculatedMetrics.trainingIntensity,
        training_speed: calculatedMetrics.trainingSpeed,
        total_o2_consumption: calculatedMetrics.totalO2Consumption,
        caloric_expenditure: calculatedMetrics.caloricExpenditure,
        weight_loss: calculatedMetrics.weightLoss
      })
      
      toast.success('Avaliação de desempenho criada com sucesso!')
      router.push('/tests/performance-evaluation')
    } catch (error) {
      toast.error('Erro ao criar avaliação de desempenho')
      console.error('Error creating performance evaluation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId)
    setSelectedStudent(student || null)
  }

  const handleTestChange = (testId: string) => {
    const test = tests.find(t => t.id === testId)
    setSelectedTest(test || null)
  }

  if (isLoadingStudents) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estudantes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Nova Avaliação de Desempenho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção do Avaliando */}
            <div className="space-y-2">
              <Label htmlFor="student">Avaliando *</Label>
              <Select onValueChange={handleStudentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um avaliando" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção do Teste de Cooper */}
            {selectedStudent && (
              <div className="space-y-2">
                <Label htmlFor="test">Teste de Cooper *</Label>
                <Select onValueChange={handleTestChange} disabled={isLoadingTests}>
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        isLoadingTests 
                          ? "Carregando testes..." 
                          : tests.length === 0 
                            ? "Nenhum teste de Cooper encontrado" 
                            : "Selecione um teste de Cooper"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {tests.map((test) => (
                      <SelectItem key={test.id} value={test.id}>
                        {new Date(test.test_date).toLocaleDateString('pt-BR')} - 
                        {test.cooper_distance}m
                        {test.vo2_max && ` (VO2: ${test.vo2_max})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {tests.length === 0 && !isLoadingTests && (
                  <p className="text-sm text-amber-600">
                    Este avaliando não possui testes de Cooper registrados.
                  </p>
                )}
              </div>
            )}

            {/* Dados do Avaliando Selecionado */}
            {selectedStudent && (
              <Card className="bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Dados do Avaliando
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nome:</span> {selectedStudent.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedStudent.email}
                    </div>
                    <div>
                      <span className="font-medium">Peso:</span> {selectedStudent.weight || 'Não informado'} kg
                    </div>
                    {selectedTest && (
                      <>
                        <div>
                          <span className="font-medium">VO2 Max:</span> {selectedTest.vo2_max || 'Não calculado'}
                        </div>
                        <div>
                          <span className="font-medium">Distância Cooper:</span> {selectedTest.cooper_distance}m
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Parâmetros de Entrada */}
            {selectedTest && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="intensity">Percentual de Intensidade (%) *</Label>
                    <Input
                      id="intensity"
                      type="number"
                      min="1"
                      max="100"
                      step="0.1"
                      value={intensityPercentage}
                      onChange={(e) => setIntensityPercentage(e.target.value)}
                      placeholder="Ex: 75"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Tempo de Treino (minutos) *</Label>
                    <Input
                      id="time"
                      type="number"
                      min="1"
                      step="0.1"
                      value={trainingTime}
                      onChange={(e) => setTrainingTime(e.target.value)}
                      placeholder="Ex: 30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testDate">Data do Teste *</Label>
                  <Input
                    id="testDate"
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Observações sobre a avaliação..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Resultados Calculados */}
            {calculatedMetrics && (
              <>
                <Separator />
                <Card className="bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Resultados Calculados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">Distância de Treino</span>
                        </div>
                        <p className="text-lg font-bold text-blue-600">
                          {calculatedMetrics.trainingDistance.toFixed(0)}m
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-sm">Intensidade</span>
                        </div>
                        <p className="text-lg font-bold text-orange-600">
                          {calculatedMetrics.trainingIntensity.toFixed(1)}%
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                          <Gauge className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-sm">Velocidade</span>
                        </div>
                        <p className="text-lg font-bold text-purple-600">
                          {calculatedMetrics.trainingSpeed.toFixed(2)} km/h
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">Consumo de O2</span>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          {calculatedMetrics.totalO2Consumption.toFixed(2)} L
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                          <Flame className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-sm">Gasto Calórico</span>
                        </div>
                        <p className="text-lg font-bold text-red-600">
                          {calculatedMetrics.caloricExpenditure.toFixed(0)} kcal
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                          <Scale className="h-4 w-4 text-indigo-600" />
                          <span className="font-medium text-sm">Peso Perdido</span>
                        </div>
                        <p className="text-lg font-bold text-indigo-600">
                          {calculatedMetrics.weightLoss.toFixed(3)} kg
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading || !selectedStudent || !selectedTest || !intensityPercentage || !trainingTime || !testDate}
                className="flex-1"
              >
                {isLoading ? 'Criando...' : 'Criar Avaliação'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}