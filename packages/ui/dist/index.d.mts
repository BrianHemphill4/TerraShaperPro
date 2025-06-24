import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as React$1 from 'react';
import React__default, { ReactNode } from 'react';
import * as class_variance_authority_dist_types from 'class-variance-authority/dist/types';
import { VariantProps } from 'class-variance-authority';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as _radix_ui_react_slot from '@radix-ui/react-slot';
import * as react_hook_form from 'react-hook-form';
import { FieldValues, FieldPath, ControllerProps } from 'react-hook-form';
import * as LabelPrimitive from '@radix-ui/react-label';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as ToastPrimitives from '@radix-ui/react-toast';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { ColumnDef } from '@tanstack/react-table';
import { LucideIcon } from 'lucide-react';
import { ClassValue } from 'clsx';
import { Variants } from 'framer-motion';

declare const Accordion: React$1.ForwardRefExoticComponent<(AccordionPrimitive.AccordionSingleProps | AccordionPrimitive.AccordionMultipleProps) & React$1.RefAttributes<HTMLDivElement>>;
declare const AccordionItem: React$1.ForwardRefExoticComponent<Omit<AccordionPrimitive.AccordionItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const AccordionTrigger: React$1.ForwardRefExoticComponent<Omit<AccordionPrimitive.AccordionTriggerProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;
declare const AccordionContent: React$1.ForwardRefExoticComponent<Omit<AccordionPrimitive.AccordionContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

declare const Alert: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & VariantProps<(props?: ({
    variant?: "default" | "destructive" | "warning" | "success" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string> & React$1.RefAttributes<HTMLDivElement>>;
declare const AlertTitle: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLHeadingElement> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const AlertDescription: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;

declare const badgeVariants: (props?: ({
    variant?: "default" | "destructive" | "secondary" | "outline" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;

type BadgeProps = {} & React$1.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;
declare function Badge({ className, variant, ...props }: BadgeProps): react_jsx_runtime.JSX.Element;

declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "destructive" | "secondary" | "outline" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;

type ButtonProps = {
    asChild?: boolean;
} & React$1.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;
declare const Button: React$1.ForwardRefExoticComponent<{
    asChild?: boolean;
} & React$1.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<(props?: ({
    variant?: "link" | "default" | "destructive" | "secondary" | "outline" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string> & React$1.RefAttributes<HTMLButtonElement>>;

declare const Card: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
declare const CardHeader: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
declare const CardTitle: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLHeadingElement> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const CardDescription: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const CardContent: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
declare const CardFooter: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;

declare const Checkbox: React$1.ForwardRefExoticComponent<Omit<CheckboxPrimitive.CheckboxProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;

declare const Dialog: React$1.FC<DialogPrimitive.DialogProps>;
declare const DialogTrigger: React$1.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const DialogPortal: React$1.FC<DialogPrimitive.DialogPortalProps>;
declare const DialogClose: React$1.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const DialogOverlay: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogOverlayProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DialogContent: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DialogHeader: {
    ({ className, ...props }: React$1.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const DialogFooter: {
    ({ className, ...props }: React$1.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const DialogTitle: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & React$1.RefAttributes<HTMLHeadingElement>, "ref"> & React$1.RefAttributes<HTMLHeadingElement>>;
declare const DialogDescription: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogDescriptionProps & React$1.RefAttributes<HTMLParagraphElement>, "ref"> & React$1.RefAttributes<HTMLParagraphElement>>;

declare const DropdownMenu: React$1.FC<DropdownMenuPrimitive.DropdownMenuProps>;
declare const DropdownMenuTrigger: React$1.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const DropdownMenuGroup: React$1.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuGroupProps & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuPortal: React$1.FC<DropdownMenuPrimitive.DropdownMenuPortalProps>;
declare const DropdownMenuSub: React$1.FC<DropdownMenuPrimitive.DropdownMenuSubProps>;
declare const DropdownMenuRadioGroup: React$1.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuRadioGroupProps & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuSubTrigger: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSubTriggerProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & {
    inset?: boolean;
} & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuSubContent: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSubContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuContent: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuItem: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & {
    inset?: boolean;
} & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuCheckboxItem: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuCheckboxItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuRadioItem: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuRadioItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuLabel: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuLabelProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & {
    inset?: boolean;
} & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuSeparator: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSeparatorProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuShortcut: {
    ({ className, ...props }: React$1.HTMLAttributes<HTMLSpanElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};

declare const Form: <TFieldValues extends FieldValues, TContext = any, TTransformedValues = TFieldValues>(props: react_hook_form.FormProviderProps<TFieldValues, TContext, TTransformedValues>) => React$1.JSX.Element;
declare const FormField: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) => react_jsx_runtime.JSX.Element;
declare const FormItem: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
declare const FormLabel: React$1.ForwardRefExoticComponent<Omit<LabelPrimitive.LabelProps & React$1.RefAttributes<HTMLLabelElement>, "ref"> & React$1.RefAttributes<HTMLLabelElement>>;
declare const FormControl: React$1.ForwardRefExoticComponent<Omit<_radix_ui_react_slot.SlotProps & React$1.RefAttributes<HTMLElement>, "ref"> & React$1.RefAttributes<HTMLElement>>;
declare const FormDescription: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const FormMessage: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;

type InputProps = {} & React$1.InputHTMLAttributes<HTMLInputElement>;
declare const Input: React$1.ForwardRefExoticComponent<React$1.InputHTMLAttributes<HTMLInputElement> & React$1.RefAttributes<HTMLInputElement>>;

declare const Label: React$1.ForwardRefExoticComponent<Omit<LabelPrimitive.LabelProps & React$1.RefAttributes<HTMLLabelElement>, "ref"> & VariantProps<(props?: class_variance_authority_dist_types.ClassProp | undefined) => string> & React$1.RefAttributes<HTMLLabelElement>>;

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    showCloseButton?: boolean;
};
declare function Modal({ isOpen, onClose, title, children, showCloseButton }: ModalProps): react_jsx_runtime.JSX.Element | null;
type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
};
declare function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, variant, }: ConfirmModalProps): react_jsx_runtime.JSX.Element;
type AlertModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    variant?: 'success' | 'error' | 'info';
};
declare function AlertModal({ isOpen, onClose, title, message, variant }: AlertModalProps): react_jsx_runtime.JSX.Element;

declare const Progress: React$1.ForwardRefExoticComponent<Omit<ProgressPrimitive.ProgressProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

declare const Select: React$1.FC<SelectPrimitive.SelectProps>;
declare const SelectGroup: React$1.ForwardRefExoticComponent<SelectPrimitive.SelectGroupProps & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectValue: React$1.ForwardRefExoticComponent<SelectPrimitive.SelectValueProps & React$1.RefAttributes<HTMLSpanElement>>;
declare const SelectTrigger: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectTriggerProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;
declare const SelectContent: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectLabel: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectLabelProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectItem: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectSeparator: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectSeparatorProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

declare const Separator: React$1.ForwardRefExoticComponent<Omit<SeparatorPrimitive.SeparatorProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

declare const Sheet: React$1.FC<DialogPrimitive.DialogProps>;
declare const SheetTrigger: React$1.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const SheetClose: React$1.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const SheetPortal: React$1.FC<DialogPrimitive.DialogPortalProps>;
declare const SheetOverlay: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogOverlayProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SheetContent: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & VariantProps<(props?: ({
    side?: "top" | "right" | "bottom" | "left" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string> & React$1.RefAttributes<HTMLDivElement>>;
declare const SheetHeader: {
    ({ className, ...props }: React$1.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const SheetFooter: {
    ({ className, ...props }: React$1.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const SheetTitle: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & React$1.RefAttributes<HTMLHeadingElement>, "ref"> & React$1.RefAttributes<HTMLHeadingElement>>;
declare const SheetDescription: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogDescriptionProps & React$1.RefAttributes<HTMLParagraphElement>, "ref"> & React$1.RefAttributes<HTMLParagraphElement>>;

declare function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
declare function ProjectCardSkeleton(): react_jsx_runtime.JSX.Element;
declare function PlantCardSkeleton(): react_jsx_runtime.JSX.Element;
declare function TableRowSkeleton({ columns }: {
    columns?: number;
}): react_jsx_runtime.JSX.Element;
declare function ListItemSkeleton(): react_jsx_runtime.JSX.Element;
declare function DashboardStatsSkeleton(): react_jsx_runtime.JSX.Element;

declare const Switch: React$1.ForwardRefExoticComponent<Omit<SwitchPrimitives.SwitchProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;

declare const Table: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLTableElement> & React$1.RefAttributes<HTMLTableElement>>;
declare const TableHeader: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLTableSectionElement> & React$1.RefAttributes<HTMLTableSectionElement>>;
declare const TableBody: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLTableSectionElement> & React$1.RefAttributes<HTMLTableSectionElement>>;
declare const TableFooter: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLTableSectionElement> & React$1.RefAttributes<HTMLTableSectionElement>>;
declare const TableRow: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLTableRowElement> & React$1.RefAttributes<HTMLTableRowElement>>;
declare const TableHead: React$1.ForwardRefExoticComponent<React$1.ThHTMLAttributes<HTMLTableCellElement> & React$1.RefAttributes<HTMLTableCellElement>>;
declare const TableCell: React$1.ForwardRefExoticComponent<React$1.TdHTMLAttributes<HTMLTableCellElement> & React$1.RefAttributes<HTMLTableCellElement>>;
declare const TableCaption: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLTableCaptionElement> & React$1.RefAttributes<HTMLTableCaptionElement>>;

declare const Tabs: React$1.ForwardRefExoticComponent<TabsPrimitive.TabsProps & React$1.RefAttributes<HTMLDivElement>>;
declare const TabsList: React$1.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsListProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const TabsTrigger: React$1.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsTriggerProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;
declare const TabsContent: React$1.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

type TextareaProps = {} & React$1.TextareaHTMLAttributes<HTMLTextAreaElement>;
declare const Textarea: React$1.ForwardRefExoticComponent<React$1.TextareaHTMLAttributes<HTMLTextAreaElement> & React$1.RefAttributes<HTMLTextAreaElement>>;

declare const ToastProvider: React$1.FC<ToastPrimitives.ToastProviderProps>;
declare const ToastViewport: React$1.ForwardRefExoticComponent<Omit<ToastPrimitives.ToastViewportProps & React$1.RefAttributes<HTMLOListElement>, "ref"> & React$1.RefAttributes<HTMLOListElement>>;
declare const Toast$1: React$1.ForwardRefExoticComponent<Omit<ToastPrimitives.ToastProps & React$1.RefAttributes<HTMLLIElement>, "ref"> & VariantProps<(props?: ({
    variant?: "default" | "destructive" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string> & React$1.RefAttributes<HTMLLIElement>>;
declare const ToastAction: React$1.ForwardRefExoticComponent<Omit<ToastPrimitives.ToastActionProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;
declare const ToastClose: React$1.ForwardRefExoticComponent<Omit<ToastPrimitives.ToastCloseProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;
declare const ToastTitle: React$1.ForwardRefExoticComponent<Omit<ToastPrimitives.ToastTitleProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const ToastDescription: React$1.ForwardRefExoticComponent<Omit<ToastPrimitives.ToastDescriptionProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
type ToastProps = React$1.ComponentPropsWithoutRef<typeof Toast$1>;
type ToastActionElement = React$1.ReactElement<typeof ToastAction>;

declare function Toaster(): react_jsx_runtime.JSX.Element;

declare const TooltipProvider: React$1.FC<TooltipPrimitive.TooltipProviderProps>;
declare const Tooltip: React$1.FC<TooltipPrimitive.TooltipProps>;
declare const TooltipTrigger: React$1.ForwardRefExoticComponent<TooltipPrimitive.TooltipTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const TooltipContent: React$1.ForwardRefExoticComponent<Omit<TooltipPrimitive.TooltipContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
};
declare function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>): react_jsx_runtime.JSX.Element;

type EmptyStateProps = {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        variant?: 'default' | 'outline' | 'secondary';
    };
    className?: string;
};
declare function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps): react_jsx_runtime.JSX.Element;
declare function NoProjectsEmptyState({ onCreateProject }: {
    onCreateProject: () => void;
}): react_jsx_runtime.JSX.Element;
declare function NoTeamMembersEmptyState({ onInvite }: {
    onInvite: () => void;
}): react_jsx_runtime.JSX.Element;
declare function NoResultsEmptyState({ query }: {
    query?: string;
}): react_jsx_runtime.JSX.Element;
declare function NoPlantsEmptyState(): react_jsx_runtime.JSX.Element;
declare function NoLayersEmptyState({ onCreateLayer }: {
    onCreateLayer: () => void;
}): react_jsx_runtime.JSX.Element;
declare function NoCommentsEmptyState(): react_jsx_runtime.JSX.Element;
declare function EmptyInbox(): react_jsx_runtime.JSX.Element;
declare function EmptyCanvas({ onAddElement }: {
    onAddElement: () => void;
}): react_jsx_runtime.JSX.Element;

type SpinnerProps = {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
};
declare function Spinner({ className, size }: SpinnerProps): react_jsx_runtime.JSX.Element;
type LoadingOverlayProps = {
    children?: React.ReactNode;
    className?: string;
};
declare function LoadingOverlay({ children, className }: LoadingOverlayProps): react_jsx_runtime.JSX.Element;
type PageLoaderProps = {
    text?: string;
};
declare function PageLoader({ text }: PageLoaderProps): react_jsx_runtime.JSX.Element;
type ButtonLoaderProps = {
    loading?: boolean;
    children: React.ReactNode;
    className?: string;
};
declare function ButtonLoader({ loading, children, className }: ButtonLoaderProps): react_jsx_runtime.JSX.Element;
type InlineLoaderProps = {
    loading?: boolean;
    children: React.ReactNode;
};
declare function InlineLoader({ loading, children }: InlineLoaderProps): react_jsx_runtime.JSX.Element;

type ErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
    errorInfo: React__default.ErrorInfo | null;
};
type ErrorBoundaryProps = {
    children: React__default.ReactNode;
    fallback?: React__default.ComponentType<ErrorFallbackProps>;
    onError?: (error: Error, errorInfo: React__default.ErrorInfo) => void;
};
type ErrorFallbackProps = {
    error: Error;
    resetError: () => void;
};
declare class ErrorBoundary extends React__default.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): ErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: React__default.ErrorInfo): void;
    resetError: () => void;
    render(): string | number | bigint | boolean | Iterable<React__default.ReactNode> | Promise<string | number | bigint | boolean | React__default.ReactPortal | React__default.ReactElement<unknown, string | React__default.JSXElementConstructor<any>> | Iterable<React__default.ReactNode> | null | undefined> | react_jsx_runtime.JSX.Element | null | undefined;
}
declare function withErrorBoundary<P extends object>(Component: React__default.ComponentType<P>, errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>): {
    (props: P): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare function PageErrorBoundary({ children }: {
    children: React__default.ReactNode;
}): react_jsx_runtime.JSX.Element;

type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
    name: TName;
};
declare const FormFieldContext: React__default.Context<FormFieldContextValue<FieldValues, string>>;
type FormItemContextValue = {
    id: string;
};
declare const FormItemContext: React__default.Context<FormItemContextValue>;
declare const useFormField: () => {
    invalid: boolean;
    isDirty: boolean;
    isTouched: boolean;
    isValidating: boolean;
    error?: react_hook_form.FieldError;
    id: string;
    name: string;
    formItemId: string;
    formDescriptionId: string;
    formMessageId: string;
};

type ToasterToast = ToastProps & {
    id: string;
    title?: React$1.ReactNode;
    description?: React$1.ReactNode;
    action?: ToastActionElement;
};
declare const actionTypes: {
    readonly ADD_TOAST: "ADD_TOAST";
    readonly UPDATE_TOAST: "UPDATE_TOAST";
    readonly DISMISS_TOAST: "DISMISS_TOAST";
    readonly REMOVE_TOAST: "REMOVE_TOAST";
};
type ActionType = typeof actionTypes;
type Action = {
    type: ActionType['ADD_TOAST'];
    toast: ToasterToast;
} | {
    type: ActionType['UPDATE_TOAST'];
    toast: Partial<ToasterToast>;
} | {
    type: ActionType['DISMISS_TOAST'];
    toastId?: ToasterToast['id'];
} | {
    type: ActionType['REMOVE_TOAST'];
    toastId?: ToasterToast['id'];
};
type State = {
    toasts: ToasterToast[];
};
declare const reducer: (state: State, action: Action) => State;
type Toast = Omit<ToasterToast, 'id'>;
declare function toast({ ...props }: Toast): {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
};
declare function useToast(): {
    toast: typeof toast;
    dismiss: (toastId?: string) => void;
    toasts: ToasterToast[];
};

declare function cn(...inputs: ClassValue[]): string;

declare const cardHover: Variants;
declare const buttonTap: Variants;
declare const fadeIn: Variants;
declare const fadeInUp: Variants;
declare const modalAnimation: Variants;
declare const staggerContainer: Variants;
declare const staggerItem: Variants;

interface BillingAlert {
    id: string;
    type: 'payment_failed' | 'subscription_expiring' | 'usage_limit' | string;
    severity: 'error' | 'warning' | 'info';
    title: string;
    message: string;
    action?: {
        label: string;
        url: string;
    };
}
interface BillingAlertsProps {
    alerts?: BillingAlert[];
    onActionClick?: (alert: BillingAlert) => void;
}
declare function BillingAlerts({ alerts, onActionClick }: BillingAlertsProps): react_jsx_runtime.JSX.Element | null;

interface Invoice {
    id: string;
    invoice_number?: string | null;
    stripe_invoice_id: string;
    created_at: string;
    amount_due: number;
    currency: string;
    status: 'paid' | 'open' | 'draft' | 'void' | 'uncollectible';
    stripe_hosted_invoice_url?: string | null;
    stripe_invoice_pdf?: string | null;
}
interface InvoiceListProps {
    invoices: Invoice[];
    total?: number;
    page?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onViewInvoice?: (invoice: Invoice) => void;
    onDownloadInvoice?: (invoice: Invoice) => void;
    formatDate?: (date: string) => string;
}
declare function InvoiceList({ invoices, total, page, pageSize, onPageChange, onViewInvoice, onDownloadInvoice, formatDate, }: InvoiceListProps): react_jsx_runtime.JSX.Element;

interface StorageBreakdown {
    project_uploads: {
        bytes: number;
        count: number;
    };
    renders: {
        bytes: number;
        count: number;
    };
    templates: {
        bytes: number;
        count: number;
    };
}
interface StorageUsageProps {
    current: number;
    limit: number;
    percentage: number;
    breakdown?: StorageBreakdown;
    currentTier?: string;
    onViewBreakdown?: () => void;
    onUpgradeStorage?: () => void;
    formatBytes?: (bytes: number) => string;
    loading?: boolean;
}
declare function StorageUsage({ current, limit, percentage, breakdown, currentTier, onViewBreakdown, onUpgradeStorage, formatBytes, loading, }: StorageUsageProps): react_jsx_runtime.JSX.Element;

interface SubscriptionPlan {
    id: string;
    name: string;
    tier: string;
    price_monthly: number;
    price_yearly?: number;
    stripe_price_id: string;
    render_credits_monthly: number;
    max_projects: number;
    max_team_members: number;
    features: {
        watermark?: boolean;
        exportFormats?: string[];
        support?: string;
        customBranding?: boolean;
        apiAccess?: boolean;
        sso?: boolean;
        [key: string]: any;
    };
}
interface PricingPlansProps {
    plans: SubscriptionPlan[];
    currentTier?: string;
    onSubscribe?: (plan: SubscriptionPlan) => void;
    loading?: string | null;
}
declare function PricingPlans({ plans, currentTier, onSubscribe, loading }: PricingPlansProps): react_jsx_runtime.JSX.Element;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Alert, AlertDescription, AlertModal, AlertTitle, Badge, type BadgeProps, type BillingAlert, BillingAlerts, type BillingAlertsProps, Button, ButtonLoader, type ButtonProps, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox, ConfirmModal, DashboardStatsSkeleton, DataTable, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, EmptyCanvas, EmptyInbox, EmptyState, ErrorBoundary, Form, FormControl, FormDescription, FormField, FormFieldContext, FormItem, FormItemContext, FormLabel, FormMessage, InlineLoader, Input, type InputProps, type Invoice, InvoiceList, type InvoiceListProps, Label, ListItemSkeleton, LoadingOverlay, Modal, NoCommentsEmptyState, NoLayersEmptyState, NoPlantsEmptyState, NoProjectsEmptyState, NoResultsEmptyState, NoTeamMembersEmptyState, PageErrorBoundary, PageLoader, PlantCardSkeleton, PricingPlans, type PricingPlansProps, Progress, ProjectCardSkeleton, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue, Separator, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger, Skeleton, Spinner, type StorageBreakdown, StorageUsage, type StorageUsageProps, type SubscriptionPlan, Switch, Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, TableRowSkeleton, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, type TextareaProps, Toast$1 as Toast, ToastAction, type ToastActionElement, ToastClose, ToastDescription, type ToastProps, ToastProvider, ToastTitle, ToastViewport, Toaster, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, badgeVariants, buttonTap, buttonVariants, cardHover, cn, fadeIn, fadeInUp, modalAnimation, reducer, staggerContainer, staggerItem, toast, useFormField, useToast, withErrorBoundary };
