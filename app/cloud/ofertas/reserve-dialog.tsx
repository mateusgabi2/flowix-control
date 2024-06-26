'use client'

import { startVastAiMachine } from '@/app/actions/startVastAiMachine'
import { getMachineLabel } from '@/app/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleDollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface ReserveDialogProps {
  qtd_cameras: number
  docker_tags?: string[]
  offer_id: string
}

const reserveFormSchema = z.object({
  machine_name: z.string(),
  docker_image: z.string(),
  qtd_cameras: z.number(),
  command: z.string(),
})

export function ReserveDialog({
  qtd_cameras: qtdCameras,
  docker_tags: dockerTags,
  offer_id: offerId,
}: ReserveDialogProps) {
  const router = useRouter()
  const form = useForm({
    resolver: zodResolver(reserveFormSchema),
    defaultValues: {
      machine_name: getMachineLabel(),
      docker_image: dockerTags?.[0] || '',
      qtd_cameras: qtdCameras,
      command: `screen -dmS SESSION; screen -S SESSION -X stuff 'python3 /Flowix/FlowixStart.py --cameras ${qtdCameras} &\\n'`,
    },
  })

  function onSubmitHandler(values: z.infer<typeof reserveFormSchema>) {
    const payload = {
      machine_name: values.machine_name,
      docker_image: values.docker_image,
      on_start_script: values.command,
      ask_contract_id: offerId,
    }
    startVastAiMachine(payload)
      .then((response) => {
        toast('Máquina reservada com sucesso!', {
          action: {
            label: 'Ver Instancia',
            onClick: () => router.push('/cloud/' + response.new_contract),
          },
        })
      })
      .catch((error) => {
        toast.error('Erro ao reservar máquina: ' + error)
      })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="space-x-1 rounded-md bg-blue-500 text-white shadow-md hover:bg-blue-700">
          <CircleDollarSign className="h-4 w-4" />
          <span>Reservar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Reservar Máquina</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitHandler)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="machine_name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel htmlFor="machine-name" className="text-right">
                        Nome da máquina
                      </FormLabel>
                      <FormControl>
                        <Input className="col-span-3" {...field} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="docker_image"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel htmlFor="docker-image" className="text-right">
                        Imagem Docker
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Selecione uma imagem Docker" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dockerTags?.map((image) => (
                            <SelectItem key={image} value={`${image}`}>
                              {image}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="command"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel htmlFor="command" className="text-right">
                        Comando
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Comando para iniciar o container"
                          className="col-span-3"
                          {...field}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button className="space-x-1 bg-red-500 text-white shadow-md hover:bg-red-700">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="space-x-1 bg-blue-500 text-white shadow-md hover:bg-blue-700"
              >
                <span>Confirmar</span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
