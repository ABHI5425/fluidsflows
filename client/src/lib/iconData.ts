import { 
  BarChartHorizontal, Layout, Lightbulb, Flag, Archive, ClipboardList,
  Network, FileText, User, Timer, CheckCircle, HelpCircle, Database, DollarSign,
  Server, Cloud, Smartphone, Monitor, Globe, Lock, Settings, ArrowRightCircle,
  XCircle, ArrowLeftRight, GitMerge, GitBranch, PauseCircle
} from "lucide-react";

export interface IconType {
  id: string;
  name: string;
  category: string;
  icon: any;
  color: string;
}

// Product Management Icons
export const productIcons: IconType[] = [
  { id: "roadmap", name: "Roadmap", category: "product", icon: Layout, color: "text-primary" },
  { id: "user-story", name: "User Story", category: "product", icon: ClipboardList, color: "text-primary" },
  { id: "sprint", name: "Sprint", category: "product", icon: Timer, color: "text-primary" },
  { id: "idea", name: "Idea", category: "product", icon: Lightbulb, color: "text-primary" },
  { id: "milestone", name: "Milestone", category: "product", icon: Flag, color: "text-primary" },
  { id: "analytics", name: "Analytics", category: "product", icon: BarChartHorizontal, color: "text-primary" },
  { id: "backlog", name: "Backlog", category: "product", icon: Archive, color: "text-primary" },
  { id: "task", name: "Task", category: "product", icon: CheckCircle, color: "text-primary" }
];

// Business Process Icons
export const businessIcons: IconType[] = [
  { id: "process", name: "Process", category: "business", icon: Network, color: "text-secondary" },
  { id: "document", name: "Document", category: "business", icon: FileText, color: "text-secondary" },
  { id: "user", name: "User", category: "business", icon: User, color: "text-secondary" },
  { id: "time", name: "Time", category: "business", icon: Timer, color: "text-secondary" },
  { id: "approval", name: "Approval", category: "business", icon: CheckCircle, color: "text-secondary" },
  { id: "decision", name: "Decision", category: "business", icon: HelpCircle, color: "text-secondary" },
  { id: "database", name: "Database", category: "business", icon: Database, color: "text-secondary" },
  { id: "finance", name: "Finance", category: "business", icon: DollarSign, color: "text-secondary" }
];

// System Architecture Icons
export const architectureIcons: IconType[] = [
  { id: "server", name: "Server", category: "architecture", icon: Server, color: "text-gray-700" },
  { id: "cloud", name: "Cloud", category: "architecture", icon: Cloud, color: "text-gray-700" },
  { id: "database-arch", name: "Database", category: "architecture", icon: Database, color: "text-gray-700" },
  { id: "mobile", name: "Mobile", category: "architecture", icon: Smartphone, color: "text-gray-700" },
  { id: "desktop", name: "Desktop", category: "architecture", icon: Monitor, color: "text-gray-700" },
  { id: "web", name: "Web", category: "architecture", icon: Globe, color: "text-gray-700" },
  { id: "security", name: "Security", category: "architecture", icon: Lock, color: "text-gray-700" },
  { id: "api", name: "API", category: "architecture", icon: Settings, color: "text-gray-700" }
];

// Workflow Elements
export const workflowIcons: IconType[] = [
  { id: "start", name: "Start", category: "workflow", icon: ArrowRightCircle, color: "text-gray-700" },
  { id: "end", name: "End", category: "workflow", icon: XCircle, color: "text-gray-700" },
  { id: "flow", name: "Flow", category: "workflow", icon: ArrowLeftRight, color: "text-gray-700" },
  { id: "merge", name: "Merge", category: "workflow", icon: GitMerge, color: "text-gray-700" },
  { id: "branch", name: "Branch", category: "workflow", icon: GitBranch, color: "text-gray-700" },
  { id: "pause", name: "Pause", category: "workflow", icon: PauseCircle, color: "text-gray-700" }
];

// All icons combined
export const allIcons: IconType[] = [
  ...productIcons,
  ...businessIcons,
  ...architectureIcons,
  ...workflowIcons
];

// Get icon by id
export const getIconById = (id: string): IconType | undefined => {
  return allIcons.find(icon => icon.id === id);
};
