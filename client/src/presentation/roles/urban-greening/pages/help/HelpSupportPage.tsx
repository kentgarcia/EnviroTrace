import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/presentation/components/shared/ui/accordion";
import { FileQuestion, Mail, Phone, ExternalLink } from "lucide-react";

const HelpSupportPage: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Help & Support</h1>
        <p className="text-gray-500">Guides, FAQs, and contact information for the Urban Greening System.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQs Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-blue-600" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Common questions about using the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I register a new tree?</AccordionTrigger>
                  <AccordionContent>
                    Navigate to the <strong>Tree Registry</strong> page and click the "Add Tree" button. Fill in the required details such as common name, location, and status. You can also upload photos.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Can I update tree health status?</AccordionTrigger>
                  <AccordionContent>
                    Yes. Select a tree from the inventory, view its details, and add a new <strong>Monitoring Log</strong>. This will automatically update the tree's health status based on your inspection report.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How are carbon statistics calculated?</AccordionTrigger>
                  <AccordionContent>
                    Carbon sequestration estimates are based on species-specific growth factors, wood density, and age of the tree. We use standard allometric equations provided by forestry research.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>What should I do if I spot a diseased tree?</AccordionTrigger>
                  <AccordionContent>
                    Please log it immediately by finding the tree in the registry (or adding it if missing) and creating a monitoring log with the status "Diseased". You can also create a "Tree Request" for urgent attention.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contact & Resources Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Email Us</div>
                  <a href="mailto:support@envirotrace.gov" className="text-sm text-blue-600 hover:underline">
                    support@envirotrace.gov
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Hotline</div>
                  <div className="text-sm text-gray-600">(02) 8123-4567</div>
                  <div className="text-xs text-gray-500">Mon-Fri, 8AM - 5PM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>External Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                <ExternalLink className="h-4 w-4 mr-2" />
                <div className="flex flex-col items-start">
                  <span>Tree ID Guide</span>
                  <span className="text-xs text-gray-500 font-normal">Learn to identify local species</span>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                <ExternalLink className="h-4 w-4 mr-2" />
                <div className="flex flex-col items-start">
                  <span>Planting Manual</span>
                  <span className="text-xs text-gray-500 font-normal">Best practices for urban planting</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
