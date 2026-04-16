"use client"

import { Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export default function ConfiguracoesPage() {
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuracoes</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as configuracoes do seu workspace
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>
              Informacoes da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input id="name" defaultValue="Lucas Silva" />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" defaultValue="lucas@sdr.ai" />
              </Field>
              <Button className="w-fit gap-2">
                <Save className="h-4 w-4" />
                Salvar Alteracoes
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificacoes</CardTitle>
            <CardDescription>
              Configure suas preferencias de notificacao
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Novos leads</p>
                  <p className="text-sm text-muted-foreground">
                    Receber notificacao quando um novo lead for atribuido
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mudanca de etapa</p>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando um lead mudar de etapa
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Lembretes</p>
                  <p className="text-sm text-muted-foreground">
                    Receber lembretes de follow-up
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>
              Configuracoes gerais do workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="workspace-name">Nome do Workspace</FieldLabel>
                  <Input id="workspace-name" defaultValue="SDR AI - Equipe Comercial" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="timezone">Fuso Horario</FieldLabel>
                  <Input id="timezone" defaultValue="America/Sao_Paulo" disabled />
                </Field>
              </div>
              <Button className="w-fit gap-2">
                <Save className="h-4 w-4" />
                Salvar Configuracoes
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
