import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageWrapper } from "@/components/layout/PageWrapper";

import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    emailjs
      .sendForm(
        "service_9ek0e77",
        "template_77xtsfi",
        formRef.current!,
        "XmVSlyspYpoLC6B4T"
      )
      .then(
        () => {
          setIsSubmitting(false);
          setIsSent(true);
          formRef.current?.reset();
        },
        (error: unknown) => {
          setIsSubmitting(false);
          console.error("EmailJS Error:", error);
          alert("Failed to send message ❌");
        }
      );
  };

  return (
    <PageWrapper className="container py-20 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Get in touch
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Have questions? Feel free to contact us anytime.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-muted-foreground">
                  support@example.com
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-sm text-muted-foreground">
                  +91 98765 43210
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Location</h3>
                <p className="text-sm text-muted-foreground">
                  India
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>
              We’ll respond as soon as possible.
            </CardDescription>
          </CardHeader>

          <form ref={formRef} onSubmit={handleSubmit}>
            <CardContent className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input name="first_name" placeholder="John" required />
                </div>

                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input name="last_name" placeholder="Doe" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="john@example.com" required />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea name="message" placeholder="How can we help?" className="min-h-[120px]" required />
              </div>

            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting || isSent} >
                {isSubmitting ? "Sending..." : isSent ? "Message Sent ✅" : "Send Message"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PageWrapper>
  );
}
