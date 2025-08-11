"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shuffle, RotateCcw, CheckCircle } from "lucide-react"

interface MatrixCell {
  value: string
  isFixed: boolean
  isCorrect?: boolean
}

interface PuzzleConfig {
  rows: number
  cols: number
  type: "system" | "determinant" | "completion"
  question: string
}

const PUZZLE_CONFIGS: PuzzleConfig[] = [
  { rows: 2, cols: 3, type: "system", question: "Completa la matriz aumentada para el sistema de ecuaciones" },
  { rows: 3, cols: 3, type: "determinant", question: "Completa la matriz para que el determinante sea 0" },
  { rows: 3, cols: 4, type: "system", question: "Organiza los coeficientes del sistema de ecuaciones" },
  { rows: 4, cols: 4, type: "completion", question: "Completa la matriz siguiendo el patrón lógico" },
  { rows: 2, cols: 5, type: "system", question: "Forma la matriz aumentada del sistema" },
  { rows: 3, cols: 2, type: "completion", question: "Completa la matriz con los valores correctos" },
]

export default function Component() {
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleConfig | null>(null)
  const [matrix, setMatrix] = useState<MatrixCell[][]>([])
  const [availableNumbers, setAvailableNumbers] = useState<string[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  const generatePuzzle = () => {
    const config = PUZZLE_CONFIGS[Math.floor(Math.random() * PUZZLE_CONFIGS.length)]
    setCurrentPuzzle(config)
    setIsComplete(false)
    setShowSolution(false)

    // Generate matrix based on puzzle type
    const newMatrix: MatrixCell[][] = []
    const numbers: string[] = []

    for (let i = 0; i < config.rows; i++) {
      const row: MatrixCell[] = []
      for (let j = 0; j < config.cols; j++) {
        const shouldBeEmpty = Math.random() < 0.4 // 40% chance of empty cell
        if (shouldBeEmpty) {
          row.push({ value: "", isFixed: false })
          // Add a number to available numbers
          const num = Math.floor(Math.random() * 10).toString()
          numbers.push(num)
        } else {
          const value = Math.floor(Math.random() * 10).toString()
          row.push({ value, isFixed: true })
        }
      }
      newMatrix.push(row)
    }

    // Add some variables for algebra
    if (config.type === "system") {
      const variables = ["x", "y", "z", "w"]
      for (let i = 0; i < Math.min(2, config.cols - 1); i++) {
        numbers.push(variables[i])
      }
    }

    // Shuffle available numbers
    const shuffledNumbers = [...numbers].sort(() => Math.random() - 0.5)

    setMatrix(newMatrix)
    setAvailableNumbers(shuffledNumbers)
  }

  const handleDragStart = (e: React.DragEvent, item: string) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault()
    if (!draggedItem || matrix[row][col].isFixed) return

    const newMatrix = [...matrix]
    const oldValue = newMatrix[row][col].value

    // Place the dragged item
    newMatrix[row][col].value = draggedItem
    setMatrix(newMatrix)

    // Update available numbers
    const newAvailable = [...availableNumbers]
    const draggedIndex = newAvailable.indexOf(draggedItem)
    if (draggedIndex > -1) {
      newAvailable.splice(draggedIndex, 1)
    }
    if (oldValue && !matrix[row][col].isFixed) {
      newAvailable.push(oldValue)
    }
    setAvailableNumbers(newAvailable)
    setDraggedItem(null)
  }

  const handleCellClick = (row: number, col: number) => {
    if (matrix[row][col].isFixed) return

    const newMatrix = [...matrix]
    const cellValue = newMatrix[row][col].value

    if (cellValue) {
      // Remove value from cell and add back to available numbers
      newMatrix[row][col].value = ""
      setMatrix(newMatrix)
      setAvailableNumbers([...availableNumbers, cellValue])
    }
  }

  const checkSolution = () => {
    // Simple validation - check if all empty cells are filled
    const allFilled = matrix.every((row) => row.every((cell) => cell.value !== ""))

    if (allFilled) {
      setScore(score + 10)
      setIsComplete(true)
    }
  }

  const resetPuzzle = () => {
    if (currentPuzzle) {
      generatePuzzle()
    }
  }

  useEffect(() => {
    generatePuzzle()
  }, [])

  if (!currentPuzzle) return null

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Puzzle de Álgebra Lineal</CardTitle>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              Puntuación: {score}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Matriz {currentPuzzle.rows}×{currentPuzzle.cols}
            </h3>
            <p className="text-blue-700 dark:text-blue-300">{currentPuzzle.question}</p>
          </div>

          {/* Matrix */}
          <div className="flex justify-center">
            <div className="inline-block border-l-2 border-r-2 border-black dark:border-white px-4 py-2">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${currentPuzzle.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${currentPuzzle.rows}, 1fr)`,
                }}
              >
                {matrix.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        w-16 h-16 border-2 border-gray-300 dark:border-gray-600 
                        flex items-center justify-center text-lg font-semibold
                        ${
                          cell.isFixed
                            ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                            : "bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        }
                        ${cell.value === "" ? "border-dashed" : "border-solid"}
                        transition-colors duration-200
                      `}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cell.value}
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>

          {/* Available Numbers */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center">Números Disponibles</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {availableNumbers.map((num, index) => (
                <div
                  key={`${num}-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, num)}
                  className="w-12 h-12 bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700 
                           flex items-center justify-center font-semibold cursor-move
                           hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200
                           rounded-lg shadow-sm"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button onClick={checkSolution} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Verificar Solución
            </Button>
            <Button onClick={resetPuzzle} variant="outline" className="flex items-center gap-2 bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </Button>
            <Button onClick={generatePuzzle} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Shuffle className="w-4 h-4" />
              Nuevo Puzzle
            </Button>
          </div>

          {/* Success Message */}
          {isComplete && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">¡Excelente! Has completado el puzzle correctamente.</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm text-gray-600 dark:text-gray-400">
            <h4 className="font-semibold mb-2">Instrucciones:</h4>
            <ul className="space-y-1">
              <li>
                • Arrastra los números desde la zona de "Números Disponibles" hacia las celdas vacías de la matriz
              </li>
              <li>• Haz clic en una celda ocupada para devolver el número a la zona disponible</li>
              <li>• Las celdas grises son fijas y no se pueden modificar</li>
              <li>• Completa la matriz siguiendo la lógica del problema planteado</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
