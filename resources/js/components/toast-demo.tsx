import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function ToastDemo() {
  const { toast } = useToast()

  return (
    <div className="space-x-2">
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: "Éxito",
            description: "La operación se completó correctamente.",
          })
        }}
      >
        Toast de Éxito
      </Button>

      <Button
        variant="destructive"
        onClick={() => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Hubo un problema con tu solicitud.",
          })
        }}
      >
        Toast de Error
      </Button>
    </div>
  )
}