import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { CommunicationAutomation } from "@/services/communicationAutomationService";
import { useCreateAutomation, useUpdateAutomation } from "@/hooks/useCommunicationAutomations";

const automationSchema = z.object({
  name: z.string().min(1, "שם הכלל נדרש"),
  description: z.string().optional(),
  trigger_event: z.string().min(1, "יש לבחור טריגר"),
  delay_hours: z.number().min(0, "עיכוב לא יכול להיות שלילי").max(8760, "עיכוב מקסימלי שנה"),
  channel: z.enum(["email", "sms", "notification", "whatsapp"]),
  message_template: z.object({
    title: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(1, "תוכן ההודעה נדרש"),
    body: z.string().optional(),
  }),
  is_active: z.boolean(),
});

type AutomationFormData = z.infer<typeof automationSchema>;

interface AutomationRuleEditorProps {
  automation?: CommunicationAutomation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId?: string;
}

const triggerOptions = [
  { value: "lead_new", label: "ליד חדש התקבל" },
  { value: "quote_sent_no_open", label: "הצעת מחיר נשלחה ולא נפתחה" },
  { value: "quote_viewed_no_accept", label: "הצעת מחיר נצפתה ולא אושרה" },
  { value: "payment_due", label: "תשלום פגוע" },
  { value: "order_completed_review", label: "הזמנה הושלמה - בקשת ביקורת" },
];

const channelOptions = [
  { value: "email", label: "מייל" },
  { value: "sms", label: "SMS" },
  { value: "notification", label: "התראה במערכת" },
  { value: "whatsapp", label: "WhatsApp" },
];

export function AutomationRuleEditor({ automation, open, onOpenChange, supplierId }: AutomationRuleEditorProps) {
  const createMutation = useCreateAutomation();
  const updateMutation = useUpdateAutomation();
  const isEditing = !!automation;

  const form = useForm<AutomationFormData>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      name: "",
      description: "",
      trigger_event: "",
      delay_hours: 0,
      channel: "email",
      message_template: {
        title: "",
        subject: "",
        message: "",
        body: "",
      },
      is_active: true,
    },
  });

  const selectedChannel = form.watch("channel");

  // Reset form when automation changes
  useEffect(() => {
    if (automation) {
      form.reset({
        name: automation.name,
        description: automation.description || "",
        trigger_event: automation.trigger_event,
        delay_hours: automation.delay_hours,
        channel: automation.channel,
        message_template: {
          title: automation.message_template.title || "",
          subject: automation.message_template.subject || "",
          message: automation.message_template.message || automation.message_template.body || "",
          body: automation.message_template.body || "",
        },
        is_active: automation.is_active,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        trigger_event: "",
        delay_hours: 0,
        channel: "email",
        message_template: {
          title: "",
          subject: "",
          message: "",
          body: "",
        },
        is_active: true,
      });
    }
  }, [automation, form]);

  const onSubmit = async (data: AutomationFormData) => {
    try {
      const automationData = {
        name: data.name,
        description: data.description,
        trigger_event: data.trigger_event,
        delay_hours: data.delay_hours,
        channel: data.channel,
        message_template: {
          ...data.message_template,
          // For different channels, store the message in the appropriate field
          ...(data.channel === 'email' && {
            subject: data.message_template.subject,
            body: data.message_template.message,
          }),
          ...(data.channel === 'sms' && {
            message: data.message_template.message,
          }),
          ...(data.channel === 'notification' && {
            title: data.message_template.title,
            message: data.message_template.message,
          }),
          ...(data.channel === 'whatsapp' && {
            message: data.message_template.message,
          }),
        },
        is_active: data.is_active,
        supplier_id: supplierId,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: automation.id,
          updates: automationData,
        });
      } else {
        await createMutation.mutateAsync(automationData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving automation:', error);
    }
  };

  const renderMessageFields = () => {
    switch (selectedChannel) {
      case "email":
        return (
          <>
            <FormField
              control={form.control}
              name="message_template.subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>נושא המייל</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="נושא המייל" />
                  </FormControl>
                  <FormDescription>
                    ניתן להשתמש במשתנים כגון {"{client_name}"}, {"{supplier_name}"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message_template.message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תוכן המייל</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="תוכן המייל כאן..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "notification":
        return (
          <>
            <FormField
              control={form.control}
              name="message_template.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כותרת ההתראה</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="כותרת ההתראה" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message_template.message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תוכן ההתראה</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="תוכן ההתראה כאן..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "sms":
      case "whatsapp":
        return (
          <FormField
            control={form.control}
            name="message_template.message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>תוכן ההודעה</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder={`תוכן ה${selectedChannel === 'sms' ? 'SMS' : 'WhatsApp'} כאן...`}
                    rows={3}
                    maxLength={160}
                  />
                </FormControl>
                <FormDescription>
                  מקסימום 160 תווים. משתנים זמינים: {"{client_name}"}, {"{supplier_phone}"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "עריכת כלל אוטומציה" : "כלל אוטומציה חדש"}
          </DialogTitle>
          <DialogDescription>
            הגדר כלל לשליחת הודעות אוטומטיות בהתבסס על אירועים במערכת
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם הכלל</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="שם הכלל" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>כלל פעיל</FormLabel>
                      <FormDescription>האם הכלל פעיל</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תיאור (אופציונלי)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="תיאור הכלל..."
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="trigger_event"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>טריגר</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר טריגר" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {triggerOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delay_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>עיכוב (שעות)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        min="0"
                        max="8760"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormDescription>0 = מיידי</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ערוץ תקשורת</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר ערוץ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {channelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <Label>תבנית ההודעה</Label>
              {renderMessageFields()}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                ביטול
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "שומר..." : (isEditing ? "עדכן" : "צור")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}