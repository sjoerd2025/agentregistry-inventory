"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { AgentResponse } from "@/lib/admin-api"
import { formatDateTime as formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import {
  X,
  Calendar,
  Tag,
  ArrowLeft,
  Bot,
  Code,
  Container,
  Cpu,
  Brain,
  Languages,
  Box,
  Clock,
  Github,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Circle,
  BadgeCheck,
  Server,
  Package,
  Globe,
  Wrench,
  Activity,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Blocks,
  Settings2,
  Network,
} from "lucide-react"
const AgentDependencyGraph = dynamic(
  () => import("@/components/agent-dependency-graph").then((m) => m.AgentDependencyGraph),
  { ssr: false },
)

interface AgentDetailProps {
  agent: AgentResponse
  onClose: () => void
}

export function AgentDetail({ agent, onClose }: AgentDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [systemMessageExpanded, setSystemMessageExpanded] = useState(false)

  const { agent: agentData, _meta } = agent
  const official = _meta?.['io.modelcontextprotocol.registry/official']
  const deployment = _meta?.deployment

  // Extract metadata
  const publisherMetadata = (agentData as any)._meta?.['io.modelcontextprotocol.registry/publisher-provided']?.['aregistry.ai/metadata']
  const identityData = publisherMetadata?.identity

  // Get owner from metadata or extract from repository URL
  const getOwner = () => {
    // Try to get email from metadata first
    if (publisherMetadata?.contact_email) return publisherMetadata.contact_email
    if (identityData?.email) return identityData.email
    if ((official as any)?.submitter) return (official as any).submitter

    // Fallback to extracting owner/org from GitHub repository URL
    if (agentData.repository?.url) {
      const match = agentData.repository.url.match(/github\.com\/([^\/]+)/)
      if (match) return match[1]
    }

    return null
  }

  const owner = getOwner()

  // kagent dependency data
  const tools = agentData.tools || []
  const skills = agentData.skills || []
  const modelConfigRef = agentData.modelConfigRef
  const systemMessage = agentData.systemMessage

  // Legacy dependency counts
  const mcpServers = agentData.mcpServers || []
  const packages = agentData.packages || []
  const remotes = agentData.remotes || []
  const dependencyCount = tools.length + skills.length + mcpServers.length + packages.length + remotes.length + (modelConfigRef ? 1 : 0)
  const hasDependencies = dependencyCount > 0 || !!systemMessage

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="container mx-auto px-6 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-10 pb-8 border-b border-primary/10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 flex-1">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/10">
              <Bot className="h-12 w-12 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3 flex-wrap">
                <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 uppercase">
                  {agentData.name}
                </h1>
                <div className="flex gap-2">
                  {agentData.agentType && (
                    <Badge variant={agentData.agentType === 'Declarative' ? 'default' : 'secondary'} className="text-xs font-bold tracking-wider uppercase px-3 py-1">
                      {agentData.agentType}
                    </Badge>
                  )}
                  {official?.isLatest && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs font-bold tracking-wider uppercase px-3 py-1">
                      Latest
                    </Badge>
                  )}
                </div>
              </div>
              {agentData.description && (
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto md:mx-0 italic border-l-4 border-primary/20 pl-4 py-1">
                  {agentData.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
             <Button variant="outline" className="gap-2 h-11 px-6 font-bold uppercase tracking-wide border-primary/20 hover:border-primary transition-all duration-300">
               <Globe className="h-4 w-4" />
               View Specs
             </Button>
             <Button variant="default" className="gap-2 h-11 px-6 font-bold uppercase tracking-wide shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
               <Activity className="h-4 w-4" />
               Live Status
             </Button>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {owner && (
            <div className="group flex items-center gap-3 px-4 py-4 bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-all duration-300">
              <div className="p-2 bg-primary/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <BadgeCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Publisher</p>
                <p className="font-bold truncate text-foreground">{owner}</p>
              </div>
            </div>
          )}

          <div className="group flex items-center gap-3 px-4 py-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-all duration-300">
            <div className="p-2 bg-muted rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Tag className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Version</p>
              <p className="font-bold text-foreground">v{agentData.version}</p>
            </div>
          </div>

          <div className="group flex items-center gap-3 px-4 py-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-all duration-300">
            <div className="p-2 bg-muted rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Circle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Status</p>
              <p className="font-bold text-foreground capitalize">{agentData.status || official?.status || 'Active'}</p>
            </div>
          </div>

          {deployment && (
            <div className={`group flex items-center gap-3 px-4 py-4 rounded-xl border transition-all duration-300 ${deployment.ready ? 'bg-green-500/5 border-green-500/10 hover:bg-green-500/10' : 'bg-red-500/5 border-red-500/10 hover:bg-red-500/10'}`}>
              <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform duration-300 ${deployment.ready ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {deployment.ready ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Deployment</p>
                <p className={`font-bold truncate ${deployment.ready ? 'text-green-600' : 'text-red-600'}`}>
                  {deployment.ready ? 'Operational' : 'Issues Detected'}
                </p>
              </div>
            </div>
          )}
        </div>


        {/* Detailed Information Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {hasDependencies && (
              <TabsTrigger value="dependencies">
                Dependencies
                <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                  {dependencyCount}
                </Badge>
              </TabsTrigger>
            )}
            <TabsTrigger value="technical">Technical Details</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Description */}
            {agentData.description && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <p className="text-base">{agentData.description}</p>
              </Card>
            )}

            {/* Basic Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Language</p>
                    <p className="font-medium">{agentData.language}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Box className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Framework</p>
                    <p className="font-medium">{agentData.framework}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Model Provider</p>
                    <p className="font-medium">{agentData.modelProvider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Model Name</p>
                    <p className="font-medium font-mono">{agentData.modelName}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Connected Resources Summary */}
            {hasDependencies && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Connected Resources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tools.length > 0 && (
                    <button
                      onClick={() => setActiveTab("dependencies")}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-left"
                    >
                      <Wrench className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{tools.length} Tool{tools.length > 1 ? 's' : ''}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {tools.map(t => t.name).join(', ')}
                        </p>
                      </div>
                    </button>
                  )}
                  {skills.length > 0 && (
                    <button
                      onClick={() => setActiveTab("dependencies")}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-left"
                    >
                      <Blocks className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{skills.length} Skill{skills.length > 1 ? 's' : ''}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {skills.map(s => s.split('/').pop() || s).join(', ')}
                        </p>
                      </div>
                    </button>
                  )}
                  {modelConfigRef && (
                    <button
                      onClick={() => setActiveTab("dependencies")}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-left"
                    >
                      <Settings2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Model Config</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{modelConfigRef}</p>
                      </div>
                    </button>
                  )}
                  {mcpServers.length > 0 && (
                    <button
                      onClick={() => setActiveTab("dependencies")}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-left"
                    >
                      <Server className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{mcpServers.length} MCP Server{mcpServers.length > 1 ? 's' : ''}</p>
                        <p className="text-xs text-muted-foreground">
                          {mcpServers.map(m => m.name).join(', ')}
                        </p>
                      </div>
                    </button>
                  )}
                  {packages.length > 0 && (
                    <button
                      onClick={() => setActiveTab("dependencies")}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-left"
                    >
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{packages.length} Package{packages.length > 1 ? 's' : ''}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {packages.map(p => p.identifier).join(', ')}
                        </p>
                      </div>
                    </button>
                  )}
                  {remotes.length > 0 && (
                    <button
                      onClick={() => setActiveTab("dependencies")}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-left"
                    >
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{remotes.length} Remote{remotes.length > 1 ? 's' : ''}</p>
                        <p className="text-xs text-muted-foreground">
                          {remotes.map(r => r.type).join(', ')}
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </Card>
            )}

            {/* Telemetry */}
            {agentData.telemetryEndpoint && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Telemetry
                </h3>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm break-all">{agentData.telemetryEndpoint}</code>
                </div>
              </Card>
            )}

            {/* Repository */}
            {agentData.repository?.url && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Repository
                </h3>
                <a
                  href={agentData.repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline break-all"
                >
                  <span>{agentData.repository.url}</span>
                  <ExternalLink className="h-4 w-4 flex-shrink-0" />
                </a>
                {agentData.repository.source && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Source: <span className="font-medium">{agentData.repository.source}</span>
                  </p>
                )}
              </Card>
            )}
          </TabsContent>

          {hasDependencies && (
            <TabsContent value="dependencies" className="space-y-4">
              {/* Dependency Graph */}
              {dependencyCount > 0 && (
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Dependency Graph
                  </h3>
                  <AgentDependencyGraph agent={agentData} />
                </Card>
              )}

              {/* Tools (from kagent) */}
              {tools.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Tools
                    <Badge variant="secondary" className="text-xs">{tools.length}</Badge>
                  </h3>
                  <div className="space-y-3">
                    {tools.map((tool, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        {tool.type === 'McpServer' ? (
                          <Server className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        ) : (
                          <Bot className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium font-mono">{tool.name}</span>
                            <Badge variant="outline" className="text-xs">{tool.type}</Badge>
                          </div>
                          {tool.toolNames && tool.toolNames.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {tool.toolNames.map((tn, j) => (
                                <Badge key={j} variant="secondary" className="text-xs font-mono">{tn}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Skills (OCI images) */}
              {skills.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Blocks className="h-5 w-5" />
                    Skills
                    <Badge variant="secondary" className="text-xs">{skills.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {skills.map((skill, i) => (
                      <div key={i} className="bg-muted p-3 rounded-lg">
                        <code className="text-sm break-all">{skill}</code>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Model Config */}
              {modelConfigRef && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    Model Config
                  </h3>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="text-sm">{modelConfigRef}</code>
                  </div>
                </Card>
              )}

              {/* System Message */}
              {systemMessage && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    System Message
                  </h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {systemMessageExpanded ? systemMessage : systemMessage.slice(0, 300)}
                      {!systemMessageExpanded && systemMessage.length > 300 && '...'}
                    </p>
                    {systemMessage.length > 300 && (
                      <button
                        onClick={() => setSystemMessageExpanded(!systemMessageExpanded)}
                        className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        {systemMessageExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            Show full message ({systemMessage.length} chars)
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </Card>
              )}

              {/* MCP Servers (legacy) */}
              {mcpServers.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    MCP Servers
                    <Badge variant="secondary" className="text-xs">{mcpServers.length}</Badge>
                  </h3>
                  <div className="space-y-3">
                    {mcpServers.map((mcp, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <Server className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{mcp.name}</span>
                            <Badge variant="outline" className="text-xs">{mcp.type}</Badge>
                          </div>
                          {mcp.url && (
                            <p className="text-sm text-muted-foreground mt-1 font-mono truncate">{mcp.url}</p>
                          )}
                          {mcp.registryServerName && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Registry: <span className="font-medium">{mcp.registryServerName}</span>
                              {mcp.registryServerVersion && (
                                <span className="ml-1">v{mcp.registryServerVersion}</span>
                              )}
                            </p>
                          )}
                          {mcp.image && (
                            <p className="text-sm text-muted-foreground mt-1 font-mono truncate">{mcp.image}</p>
                          )}
                          {mcp.command && (
                            <p className="text-sm text-muted-foreground mt-1 font-mono">
                              {mcp.command} {mcp.args?.join(' ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Packages */}
              {packages.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Packages
                    <Badge variant="secondary" className="text-xs">{packages.length}</Badge>
                  </h3>
                  <div className="space-y-3">
                    {packages.map((pkg, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <Package className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium font-mono">{pkg.identifier}</span>
                            <Badge variant="outline" className="text-xs">{pkg.registryType}</Badge>
                            {pkg.version && (
                              <Badge variant="secondary" className="text-xs">v{pkg.version}</Badge>
                            )}
                          </div>
                          {pkg.transport?.type && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Transport: {pkg.transport.type}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Remotes */}
              {remotes.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Remote Endpoints
                    <Badge variant="secondary" className="text-xs">{remotes.length}</Badge>
                  </h3>
                  <div className="space-y-3">
                    {remotes.map((remote, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <Globe className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">{remote.type}</Badge>
                          </div>
                          {remote.url && (
                            <p className="text-sm text-muted-foreground mt-1 font-mono truncate">{remote.url}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>
          )}

          <TabsContent value="technical" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Repository & Source */}
              {agentData.repository?.url && (
                <Card className="p-6 bg-gradient-to-br from-card to-muted/20 border-primary/10 shadow-sm relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Github className="h-12 w-12" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70 mb-5 flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    Source Control
                  </h3>
                  <div className="space-y-4 relative z-10">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Repository URL</p>
                      <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-primary/5 hover:border-primary/20 transition-colors">
                        <code className="text-xs font-mono text-primary truncate flex-1">{agentData.repository.url}</code>
                        <a
                          href={agentData.repository.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-primary/10 rounded-md transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                    {agentData.repository.source && (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">Provider</span>
                        <Badge variant="outline" className="font-bold uppercase text-[10px] tracking-tighter px-2">
                          {agentData.repository.source}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Container Infrastructure */}
              {agentData.image && (
                <Card className="p-6 bg-gradient-to-br from-card to-muted/20 border-primary/10 shadow-sm group">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70 mb-5 flex items-center gap-2">
                    <Container className="h-4 w-4" />
                    Deployment Artifact
                  </h3>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Container Image</p>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 relative group-hover:border-primary/20 transition-all duration-500">
                      <div className="flex items-start gap-3">
                        <Box className="h-4 w-4 text-primary/40 mt-1" />
                        <code className="text-xs font-mono text-zinc-300 break-all leading-relaxed">
                          {agentData.image}
                        </code>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20 font-mono">
                          LATEST
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Endpoints Grid */}
            {(agentData.websiteUrl || agentData.telemetryEndpoint) && (
              <Card className="p-6 bg-gradient-to-br from-card to-muted/10 border-primary/5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70 mb-5 flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Service Endpoints
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agentData.websiteUrl && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Public Website</p>
                      <a
                        href={agentData.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-background/40 hover:bg-background/80 rounded-lg border border-border/50 group transition-all"
                      >
                        <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-xs font-mono truncate flex-1">{agentData.websiteUrl}</span>
                        <ExternalLink className="h-3 w-3 opacity-40" />
                      </a>
                    </div>
                  )}
                  {agentData.telemetryEndpoint && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Telemetry Sink</p>
                      <div className="flex items-center gap-3 p-3 bg-background/40 rounded-lg border border-border/50">
                        <Activity className="h-4 w-4 text-primary/40" />
                        <code className="text-xs font-mono truncate flex-1">{agentData.telemetryEndpoint}</code>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Lifecycle Timestamps */}
            <Card className="p-6 border-primary/5 shadow-sm bg-muted/5">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70 mb-6 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Registry Lifecycle
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Visual Connector Line (hidden on mobile) */}
                <div className="hidden md:block absolute top-[2.25rem] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                
                <div className="relative z-10 text-center md:text-left">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto md:mx-0 mb-3 shadow-sm">
                    <Calendar className="h-4 w-4 text-primary/60" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Created</p>
                  <p className="text-sm font-mono font-bold">{official?.publishedAt ? formatDate(official.publishedAt) : '—'}</p>
                </div>

                <div className="relative z-10 text-center md:text-left">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto md:mx-0 mb-3 shadow-sm">
                    <Activity className="h-4 w-4 text-primary/60" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Last Update</p>
                  <p className="text-sm font-mono font-bold">{agentData.updatedAt ? formatDate(agentData.updatedAt) : '—'}</p>
                </div>

                <div className="relative z-10 text-center md:text-left">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto md:mx-0 mb-3 shadow-sm">
                    <BadgeCheck className="h-4 w-4 text-primary/60" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Registry Sync</p>
                  <p className="text-sm font-mono font-bold">{official?.updatedAt ? formatDate(official.updatedAt) : 'Synced'}</p>
                </div>
              </div>
            </Card>
          </TabsContent>


          <TabsContent value="raw">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Raw JSON Data
                </h3>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(agent, null, 2)}
              </pre>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

