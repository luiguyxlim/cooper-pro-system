'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Calendar, Mail, Phone, MapPin, Eye, EyeOff } from 'lucide-react'
import { Student } from '@/lib/types'
import { toggleStudentStatus } from '@/lib/actions/students'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface StudentCardProps {
  student: Student
  onStatusChange?: () => void
}

export function StudentCard({ student, onStatusChange }: StudentCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const handleToggleStatus = async () => {
    setIsLoading(true)
    try {
      await toggleStudentStatus(student.id)
      toast.success(
        student.is_active 
          ? 'Estudante desativado com sucesso' 
          : 'Estudante reativado com sucesso'
      )
      onStatusChange?.()
    } catch (error) {
      toast.error('Erro ao alterar status do estudante')
      console.error('Error toggling student status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewTests = () => {
    router.push(`/evaluatees/${student.id}`)
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${
      !student.is_active ? 'opacity-60 bg-gray-50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {student.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={student.is_active ? 'default' : 'secondary'}
                  className={student.is_active ? 'bg-green-100 text-green-800' : ''}
                >
                  {student.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
                {student.birth_date && (
                  <span className="text-sm text-gray-500">
                    {calculateAge(student.birth_date)} anos
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {student.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{student.email}</span>
          </div>
        )}
        
        {student.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{student.phone}</span>
          </div>
        )}
        
        {student.birth_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{new Date(student.birth_date).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        
        {student.address && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{student.address}</span>
          </div>
        )}
        
        <div className="flex gap-2 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewTests}
            className="flex-1"
          >
            Ver Testes
          </Button>
          
          <Button
            variant={student.is_active ? "outline" : "default"}
            size="sm"
            onClick={handleToggleStatus}
            disabled={isLoading}
            className={`flex items-center gap-1 ${
              student.is_active 
                ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {student.is_active ? (
              <>
                <EyeOff className="h-4 w-4" />
                Desativar
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Reativar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}