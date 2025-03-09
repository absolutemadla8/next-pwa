export interface ToolProps {
    chatId: string;
    results?: any;
    state?: string;
    args?: any;
    toolName: string;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }