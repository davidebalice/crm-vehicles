import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useParams } from "wouter";
import { z } from "zod";

const imageFormSchema = z.object({
  mainImage: z.any().optional(),
  images: z.any().optional(), // file list
});

type ImageFormValues = z.infer<typeof imageFormSchema>;

const VehiclePhotoPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const isEditing = !!id;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const { toast } = useToast();

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);

  const form = useForm<ImageFormValues>({
    resolver: zodResolver(imageFormSchema),
  });

  const { isLoading } = useQuery({
    queryKey: [`/api/vehicles/${id}`],
    enabled: isEditing,
  });

  const onSubmit = async (data: ImageFormValues) => {
    try {
      const token = localStorage.getItem("jwt_token");

      // Verifica se ci sono immagini da inviare
      if (!mainImage && selectedImages.length === 0) {
        toast({
          title: "Errore",
          description: "Nessuna immagine selezionata.",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();

      // Aggiungi l'immagine principale
      if (mainImage) {
        formData.append("mainImage", mainImage);
      }

      console.log(mainImage);

      // Aggiungi altre immagini
      selectedImages.forEach((file) => {
        formData.append("otherImages", file);
      });

      // Invio della richiesta per caricare le immagini
      const response = await fetch(
        `${baseUrl}/api/vehicles/${id}/upload-images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      console.log("response aa");
      console.log(response);

      if (!response.ok) {
        throw new Error("Errore durante il caricamento delle immagini");
      }

      toast({
        title: "Immagini caricate",
        description: "Le immagini sono state caricate con successo",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      navigate("/vehicles");
    } catch (error) {
      toast({
        title: "Errore",
        description: `Errore durante il caricamento: ${
          error instanceof Error ? error.message : "Sconosciuto"
        }`,
        variant: "destructive",
      });
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleOtherImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => navigate(`/vehicles/details/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-montserrat font-bold text-2xl">
          Carica immagini veicolo
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Carica Immagini</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing && isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Caricamento...
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="mainImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Immagine principale</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altre immagini</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleOtherImagesChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => navigate("/vehicles")}
                  >
                    Annulla
                  </Button>
                  <Button type="submit">Carica immagini</Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VehiclePhotoPage;
