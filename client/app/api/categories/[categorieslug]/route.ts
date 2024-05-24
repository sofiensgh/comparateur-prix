// // pages/api/categories/[categorySlug].ts

// import { NextApiRequest, NextApiResponse } from 'next';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { categorie } = req.query;

//   try {
//     const response = await fetch(`http://localhost:5000/api/categories/${categorie}`);
//     const data = await response.json();

//     if (!data.length) {
//       return res.status(404).json({ message: "No data found for this category" });
//     }

//     res.status(200).json(data);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// }