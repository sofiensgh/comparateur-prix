"use client"
const Searchbar = () => {
    const handleSumbit = () => {

    }
  return (
    <form
    className="flex flex-wrap gap-4 mt-12"
    onSubmit={handleSumbit}
    >
<input 
type="text"
placeholder="entrer le titre de produit"
className="searchbar-input"
/>
<button 
type="submit"
className="searchbar-btn"
>Recherche</button>
</form>
  )
}

export default Searchbar