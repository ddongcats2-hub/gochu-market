function SearchBar({
    search,
    setSearch,
}){

    return(

        <input
            className="search"
            placeholder="무엇을 찾고 계신가요?"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
        />

    );

}

export default SearchBar;