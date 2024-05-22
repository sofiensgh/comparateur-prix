interface Product {
    _id: string;
    title: string;
    name: string; // If you have a separate name field
    price: number;
    currency: string;
    reference: string;
    description: string;
    availability: string;
    img: string; // or `image` if you use this field
    image: string; // or `image` if you use this field

    productUrl: string;
    categorie: string;
    fournisseur: string;
    brand: string;
    rate: number; // If you have rating information
    // Add other fields if necessary
  }
  