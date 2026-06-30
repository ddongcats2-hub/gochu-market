function ScovilleCard({
profile,
}){

return(

<div className="scovilleCard">

<div>

<p>
🌶 내 스코빌
</p>

<h2>

{profile.scoville} SHU

</h2>

<span>

거래 {profile.deals}회

</span>

</div>

<div className="pepperIcon">

🌶️

</div>

</div>

);

}

export default ScovilleCard;