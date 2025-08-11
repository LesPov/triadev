"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shuffle, RotateCcw, CheckCircle, AlertCircle } from "lucide-react"

interface FormulaData {
  title: string
  formula: string
  description: string
  matrixSize: { rows: number; cols: number }
  correctMatrix: string[][]
  givenValues: string[]
  explanation: string
}

const FORMULAS: FormulaData[] = [
  {
    title: "Área de un Triángulo",
    formula: "Área = ½ × det([x₁ y₁ 1; x₂ y₂ 1; x₃ y₃ 1])",
    description: "Encuentra el área del triángulo con vértices: (-2,1), (-4,-3), (7,2)",
    matrixSize: { rows: 3, cols: 3 },
    correctMatrix: [
      ["-2", "1", "1"],
      ["-4", "-3", "1"],
      ["7", "2", "1"],
    ],
    givenValues: ["-2", "1", "1", "-4", "-3", "1", "7", "2", "1"],
    explanation: "Los vértices se organizan como: [x₁ y₁ 1], [x₂ y₂ 1], [x₃ y₃ 1]",
  },
  {
    title: "Sistema de Ecuaciones 2x2",
    formula: "Ax = b → [a₁₁ a₁₂; a₂₁ a₂₂][x₁; x₂] = [b₁; b₂]",
    description: "Sistema: 3x + 2y = 7, x - 4y = -5",
    matrixSize: { rows: 2, cols: 3 },
    correctMatrix: [
      ["3", "2", "7"],
      ["1", "-4", "-5"],
    ],
    givenValues: ["3", "2", "7", "1", "-4", "-5"],
    explanation: "Matriz aumentada: coeficientes de x, coeficientes de y, términos independientes",
  },
  {
    title: "Determinante 2x2",
    formula: "det(A) = ad - bc para A = [a b; c d]",
    description: "Organiza la matriz: elementos 5, -2, 3, 1",
    matrixSize: { rows: 2, cols: 2 },
    correctMatrix: [
      ["5", "-2"],
      ["3", "1"],
    ],
    givenValues: ["5", "-2", "3", "1"],
    explanation: "Matriz 2x2 estándar: [a b; c d]",
  },
  {
    title: "Área de Triángulo (Ejemplo 2)",
    formula: "Área = ½ × det([x₁ y₁ 1; x₂ y₂ 1; x₃ y₃ 1])",
    description: "Encuentra el área del triángulo con vértices: (0,0), (3,0), (1,4)",
    matrixSize: { rows: 3, cols: 3 },
    correctMatrix: [
      ["0", "0", "1"],
      ["3", "0", "1"],
      ["1", "4", "1"],
    ],
    givenValues: ["0", "0", "1", "3", "0", "1", "1", "4", "1"],
    explanation: "Cada fila representa un vértice: [x y 1]",
  },
  {
    title: "Sistema 3x3",
    formula: "Sistema de 3 ecuaciones con 3 incógnitas",
    description: "Sistema: x + 2y - z = 3, 2x - y + z = 1, x + y + z = 6",
    matrixSize: { rows: 3, cols: 4 },
    correctMatrix: [
      ["1", "2", "-1", "3"],
      ["2", "-1", "1", "1"],
      ["1", "1", "1", "6"],
    ],
    givenValues: ["1", "2", "-1", "3", "2", "-1", "1", "1", "1", "1", "1", "6"],
    explanation: "Matriz aumentada: coeficientes de x, y, z, y términos independientes",
  },
]

export default function Component() {
  const [currentFormula, setCurrentFormula] = useState<FormulaData | null>(null)
  const [userMatrix, setUserMatrix] = useState<string[][]>([])
  const [availableValues, setAvailableValues] = useState<string[]>([])
  const [draggedValue, setDraggedValue] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const generatePuzzle = () => {
    const formula = FORMULAS[Math.floor(Math.random() * FORMULAS.length)]
    setCurrentFormula(formula)
    setIsComplete(false)
    setShowHint(false)
    setAttempts(0)

    // Initialize empty matrix
    const emptyMatrix: string[][] = []
    for (let i = 0; i < formula.matrixSize.rows; i++) {
      const row: string[] = []
      for (let j = 0; j < formula.matrixSize.cols; j++) {
        row.push("")
      }
      emptyMatrix.push(row)
    }

    // Shuffle available values
    const shuffledValues = [...formula.givenValues].sort(() => Math.random() - 0.5)

    setUserMatrix(emptyMatrix)
    setAvailableValues(shuffledValues)
  }

  const handleDragStart = (e: React.DragEvent, value: string) => {
    setDraggedValue(value)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault()
    if (!draggedValue || !currentFormula) return

    const newMatrix = [...userMatrix]
    const oldValue = newMatrix[row][col]

    // Place the dragged value
    newMatrix[row][col] = draggedValue
    setUserMatrix(newMatrix)

    // Update available values
    const newAvailable = [...availableValues]
    const draggedIndex = newAvailable.indexOf(draggedValue)
    if (draggedIndex > -1) {
      newAvailable.splice(draggedIndex, 1)
    }
    if (oldValue) {
      newAvailable.push(oldValue)
    }
    setAvailableValues(newAvailable)
    setDraggedValue(null)
  }

  const handleCellClick = (row: number, col: number) => {
    const cellValue = userMatrix[row][col]
    if (!cellValue) return

    // Remove value from cell and add back to available values
    const newMatrix = [...userMatrix]
    newMatrix[row][col] = ""
    setUserMatrix(newMatrix)
    setAvailableValues([...availableValues, cellValue])
  }

  const checkSolution = () => {
    if (!currentFormula) return

    setAttempts(attempts + 1)

    // Check if matrix matches the correct solution
    let isCorrect = true
    for (let i = 0; i < currentFormula.matrixSize.rows; i++) {
      for (let j = 0; j < currentFormula.matrixSize.cols; j++) {
        if (userMatrix[i][j] !== currentFormula.correctMatrix[i][j]) {
          isCorrect = false
          break
        }
      }
      if (!isCorrect) break
    }

    if (isCorrect) {
      setScore(score + Math.max(10 - attempts, 5))
      setIsComplete(true)
    } else {
      // Show hint after 2 failed attempts
      if (attempts >= 2) {
        setShowHint(true)
      }
    }
  }

  const resetPuzzle = () => {
    if (currentFormula) {
      const emptyMatrix: string[][] = []
      for (let i = 0; i < currentFormula.matrixSize.rows; i++) {
        const row: string[] = []
        for (let j = 0; j < currentFormula.matrixSize.cols; j++) {
          row.push("")
        }
        emptyMatrix.push(row)
      }
      setUserMatrix(emptyMatrix)
      setAvailableValues([...currentFormula.givenValues].sort(() => Math.random() - 0.5))
      setAttempts(0)
      setShowHint(false)
    }
  }

  useEffect(() => {
    generatePuzzle()
  }, [])

  if (!currentFormula) return null

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Puzzle de Fórmulas Matemáticas</CardTitle>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              Puntuación: {score}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formula and Description */}
          <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg space-y-3">
            <h3 className="font-bold text-xl text-blue-800 dark:text-blue-200">{currentFormula.title}</h3>
            <div className="bg-white dark:bg-blue-900 p-3 rounded border-l-4 border-blue-500">
              <code className="text-lg font-mono text-blue-700 dark:text-blue-300">{currentFormula.formula}</code>
            </div>
            <p className="text-blue-700 dark:text-blue-300 font-medium">{currentFormula.description}</p>
          </div>

          {/* Matrix Display */}
          <div className="flex justify-center">
            <div className="inline-block">
              <div className="text-center mb-4">
                <span className="text-lg font-semibold">Organiza los valores en la matriz:</span>
              </div>
              <div className="inline-block border-l-4 border-r-4 border-black dark:border-white px-6 py-4">
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${currentFormula.matrixSize.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${currentFormula.matrixSize.rows}, 1fr)`,
                  }}
                >
                  {userMatrix.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          w-20 h-20 border-2 border-gray-400 dark:border-gray-500
                          flex items-center justify-center text-xl font-bold
                          bg-white dark:bg-gray-900 cursor-pointer 
                          hover:bg-gray-50 dark:hover:bg-gray-800
                          ${cell === "" ? "border-dashed border-gray-300" : "border-solid"}
                          transition-all duration-200 rounded-lg shadow-sm
                        `}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {cell}
                      </div>
                    )),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Available Values */}
          <div className="space-y-4">
            <h4 className="font-semibold text-center text-lg">Valores Disponibles</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {availableValues.map((value, index) => (
                <div
                  key={`${value}-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, value)}
                  className="w-16 h-16 bg-green-100 dark:bg-green-900 border-2 border-green-400 dark:border-green-600
                           flex items-center justify-center font-bold text-lg cursor-move
                           hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200
                           rounded-lg shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  {value}
                </div>
              ))}
            </div>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Pista:</h4>
                  <p className="text-yellow-700 dark:text-yellow-300">{currentFormula.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button onClick={checkSolution} className="flex items-center gap-2 px-6">
              <CheckCircle className="w-4 h-4" />
              Verificar Solución
            </Button>
            <Button onClick={resetPuzzle} variant="outline" className="flex items-center gap-2 px-6 bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </Button>
            <Button onClick={generatePuzzle} variant="outline" className="flex items-center gap-2 px-6 bg-transparent">
              <Shuffle className="w-4 h-4" />
              Nueva Fórmula
            </Button>
          </div>

          {/* Success Message */}
          {isComplete && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-6 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-200 mb-2">
                <CheckCircle className="w-6 h-6" />
                <span className="font-bold text-lg">¡Excelente trabajo!</span>
              </div>
              <p className="text-green-700 dark:text-green-300">
                Has organizado correctamente la matriz según la fórmula.
                {attempts === 1 ? " ¡Perfecto en el primer intento!" : ` Lo lograste en ${attempts} intentos.`}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Cómo jugar:</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                • <strong>Arrastra</strong> los valores desde la zona verde hacia las celdas de la matriz
              </li>
              <li>
                • <strong>Haz clic</strong> en una celda ocupada para devolver el valor a la zona disponible
              </li>
              <li>
                • <strong>Organiza</strong> los valores según la fórmula matemática presentada
              </li>
              <li>
                • <strong>Verifica</strong> tu solución cuando creas que está correcta
              </li>
              <li>• Después de 2 intentos fallidos, aparecerá una pista para ayudarte</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
