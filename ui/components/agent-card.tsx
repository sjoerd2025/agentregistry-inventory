"use client"

import { AgentResponse } from "@/lib/admin-api"
import { formatDate, getStatusBadgeStyles } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Calendar, Tag, Bot, Container, Cpu, Brain, Github, BadgeCheck, Play, StopCircle, CheckCircle2, XCircle } from "lucide-react"

interface AgentCardProps {
  agent: AgentResponse
  onDeploy?: (agent: AgentResponse) => void
  onUndeploy?: (agent: AgentResponse) => void
  showDeploy?: boolean
  showExternalLinks?: boolean
  onClick?: () => void
}

export function AgentCard({ agent, onDeploy, onUndeploy, showDeploy = true, showExternalLinks = true, onClick }: AgentCardProps) {
  const { agent: agentData, _meta } = agent

  // Get deployment status
  const deployment = _meta?.deployment
  const isExternal = _meta?.isDiscovered || _meta?.source === 'discovery'
  const deploymentStatus = isExternal
    ? (deployment?.ready ? "Running" : deployment ? "Failed" : "External")
    : (deployment?.ready ? "Running" : deployment ? "Failed" : "Not Deployed")

  // Extract metadata
  const publisherMetadata = (agentData as any)._meta?.['io.modelcontextprotocol.registry/publisher-provided']?.['aregistry.ai/metadata']
  const identityData = publisherMetadata?.identity

  // Get owner from metadata or extract from repository URL
  const getOwner = () => {
    // Try to get email from metadata first
    if (publisherMetadata?.contact_email) return publisherMetadata.contact_email
    if (identityData?.email) return identityData.email

    // Fallback to extracting owner/org from GitHub repository URL
    if (agentData.repository?.url) {
      const match = agentData.repository.url.match(/github\.com\/([^\/]+)/)
      if (match) return match[1]
    }

    return null
  }

  const owner = getOwner()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  // Format date

  return (
    <TooltipProvider>
      <Card
        className="group p-5 hover:shadow-xl transition-all duration-300 cursor-pointer border hover:border-primary/40 relative overflow-hidden bg-gradient-to-br from-card to-card/95 hover:to-primary/[0.02]"
        onClick={handleClick}
      >
        {/* Subtle decorative background element */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
        
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-1 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h3 className="font-bold text-xl tracking-tight group-hover:text-primary transition-colors duration-300 uppercase">
                  {agentData.name}
                </h3>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0">
                  Agent
                </Badge>
                {/* Deployment status badge */}
                <Badge 
                  variant="outline" 
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0 ${getStatusBadgeStyles(deploymentStatus)}`}
                >
                  {deploymentStatus === "Running" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {deploymentStatus === "Failed" && <XCircle className="h-3 w-3 mr-1" />}
                  {deploymentStatus}
                </Badge>
                {/* External badge */}
                {isExternal && deploymentStatus !== "External" && (
                  <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0">
                    External
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {agentData.framework && (
                  <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                    {agentData.framework}
                  </span>
                )}
                {agentData.language && (
                  <span className="text-[10px] font-bold text-primary/70 uppercase border border-primary/20 px-1.5 py-0.5 rounded">
                    {agentData.language}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            {!isExternal && showDeploy && deploymentStatus === "Not Deployed" && onDeploy && (
              <Button
                variant="default"
                size="sm"
                className="h-9 px-4 gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeploy(agent)
                }}
              >
                <Play className="h-3.5 w-3.5" />
                Deploy
              </Button>
            )}
            {!isExternal && showDeploy && deploymentStatus === "Running" && onUndeploy && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation()
                  onUndeploy(agent)
                }}
              >
                <StopCircle className="h-3.5 w-3.5" />
                Undeploy
              </Button>
            )}
          </div>
        </div>

        {agentData.description && (
          <p className="text-sm text-foreground/80 mb-4 line-clamp-2 leading-relaxed italic border-l-2 border-primary/20 pl-3">
            {agentData.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground pt-4 border-t border-primary/5">
          {owner && (
            <div className="flex items-center gap-1.5 text-primary/80 font-semibold group-hover:text-primary transition-colors duration-300">
              <BadgeCheck className="h-3.5 w-3.5" />
              <span>{owner}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 opacity-70" />
            <span className="font-medium">v{agentData.version}</span>
          </div>

          {agentData.modelProvider && (
            <div className="flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5 opacity-70" />
              <span>{agentData.modelProvider}</span>
            </div>
          )}

          {agentData.modelName && (
            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full">
              <Cpu className="h-3.5 w-3.5 opacity-70" />
              <span className="font-mono">{agentData.modelName}</span>
            </div>
          )}

          {agentData.image && (
            <div className="flex items-center gap-1.5 max-w-[180px]">
              <Container className="h-3.5 w-3.5 opacity-70" />
              <span className="font-mono truncate" title={agentData.image}>
                {agentData.image}
              </span>
            </div>
          )}

          {showExternalLinks && agentData.repository?.url && (
            <a
              href={agentData.repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-primary transition-all duration-300 hover:translate-x-0.5 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Github className="h-3.5 w-3.5" />
              <span className="font-bold">REPO</span>
            </a>
          )}
        </div>
      </Card>
    </TooltipProvider>
  )

}
