import json
import os
import random
from datetime import date, timedelta
import pandas as pd
import streamlit as st

# ──────────────────────────── Page Config ────────────────────────────
st.set_page_config(
    page_title="StayFinder · Iconic Stays in India",
    page_icon="🏖️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ──────────────────────────── Custom Styling ────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'DM Sans', sans-serif;
    }
    
    .hero-banner {
        background: linear-gradient(135deg, #3d2b1f 0%, #1f140e 100%);
        padding: 2rem 2.2rem;
        border-radius: 16px;
        color: #faf7f2;
        margin-bottom: 1.75rem;
        box-shadow: 0 6px 24px rgba(61, 43, 31, 0.12);
        border: 1px solid #c9973a;
    }
    
    .hero-title {
        font-family: 'Playfair Display', serif;
        font-size: 2.2rem;
        font-weight: 700;
        color: #faf7f2;
        margin: 0;
    }
    
    .hero-title span {
        color: #c9973a;
    }
    
    .hero-desc {
        color: #d8cec3;
        font-size: 0.95rem;
        margin-top: 0.35rem;
    }
    
    .cat-chip {
        background: #f4ede3;
        color: #5c4738;
        padding: 3px 10px;
        border-radius: 16px;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1px solid #e2d5c5;
        display: inline-block;
    }
    
    .price-text {
        font-size: 1.25rem;
        font-weight: 700;
        color: #3d2b1f;
    }
    
    .review-bubble {
        background: #faf7f2;
        border-left: 3px solid #c9973a;
        padding: 10px 14px;
        border-radius: 8px;
        margin-bottom: 8px;
        font-size: 0.88rem;
    }
    
    .review-author {
        font-weight: 600;
        color: #3d2b1f;
    }
    
    .review-comment {
        color: #5c4738;
        margin-top: 2px;
    }
</style>
""", unsafe_allow_html=True)

# ──────────────────────────── Data Loader ────────────────────────────
def get_data_file():
    return os.path.join(os.path.dirname(__file__), "data", "listings.json")

def load_places():
    path = get_data_file()
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

if "listings" not in st.session_state:
    st.session_state.listings = load_places()

if "bookings" not in st.session_state:
    st.session_state.bookings = []

# ──────────────────────────── Hero Banner ────────────────────────────
st.markdown("""
<div class="hero-banner">
    <h1 class="hero-title">StayFinder<span>.</span> India</h1>
    <p class="hero-desc">Explore handpicked stays across 6 famous destinations in India — Goa, Manali, Jaipur, Udaipur, Munnar, and Alleppey.</p>
</div>
""", unsafe_allow_html=True)

# ──────────────────────────── Sidebar Filters ────────────────────────────
st.sidebar.markdown("### 🔍 Search & Filters")

search_kw = st.sidebar.text_input("Search destination or stay", placeholder="e.g. Goa, Manali, Villa...")

dest_options = ["All India", "Goa", "Manali", "Jaipur", "Udaipur", "Munnar", "Alleppey"]
chosen_dest = st.sidebar.selectbox("Famous Destinations", dest_options)

cat_options = ["All Categories", "Beach", "Mountains", "Historical", "Castle", "Countryside", "Lake"]
chosen_cat = st.sidebar.selectbox("Category", cat_options)

sort_by = st.sidebar.selectbox("Sort By", ["Recommended", "Price: Low to High", "Price: High to Low", "Top Rated"])

include_tax = st.sidebar.toggle("Include 18% GST in price", value=False)

st.sidebar.markdown("---")
st.sidebar.caption(f"**Total Places:** {len(st.session_state.listings)}")
st.sidebar.caption(f"**Active Reservations:** {len(st.session_state.bookings)}")

# ──────────────────────────── Filter & Sort Logic ────────────────────────────
filtered = []
for p in st.session_state.listings:
    # Destination filter
    if chosen_dest != "All India":
        if chosen_dest.lower() not in p.get("location", "").lower():
            continue

    # Category filter
    if chosen_cat != "All Categories":
        if p.get("category") != chosen_cat:
            continue

    # Search keyword
    if search_kw:
        q = search_kw.lower()
        t = p.get("title", "").lower()
        d = p.get("description", "").lower()
        l = p.get("location", "").lower()
        if not (q in t or q in d or q in l):
            continue

    filtered.append(p)

if sort_by == "Price: Low to High":
    filtered.sort(key=lambda x: x.get("price", 0))
elif sort_by == "Price: High to Low":
    filtered.sort(key=lambda x: x.get("price", 0), reverse=True)
elif sort_by == "Top Rated":
    filtered.sort(key=lambda x: x.get("rating", 4.9), reverse=True)

# ──────────────────────────── Main Tabs ────────────────────────────
tab_stays, tab_map, tab_res = st.tabs([
    f"🏖️ Famous Stays in India ({len(filtered)})",
    "🗺️ Map of Destinations",
    f"📅 My Bookings ({len(st.session_state.bookings)})"
])

# ──────────────────────────── Tab 1: Stays & Reviews ────────────────────────────
with tab_stays:
    if not filtered:
        st.info("No stays found matching your filter. Try selecting 'All India'.")
    else:
        for idx, stay in enumerate(filtered):
            with st.container():
                col_img, col_info = st.columns([1.2, 2], gap="large")

                # Image Column
                with col_img:
                    img_url = stay.get("image", {}).get("url") if isinstance(stay.get("image"), dict) else stay.get("image", "")
                    if img_url:
                        st.image(img_url, use_container_width=True)

                # Info Column
                with col_info:
                    st.markdown(f"### {stay.get('title')}")
                    st.caption(f"📍 **{stay.get('location')}**, {stay.get('country')} · ⭐ **{stay.get('rating', 4.9)}/5**")
                    
                    st.markdown(f"<span class='cat-chip'>{stay.get('category')}</span>", unsafe_allow_html=True)
                    st.write(stay.get("description", ""))

                    # Amenities
                    amenities = stay.get("amenities", [])
                    if amenities:
                        st.caption("✨ " + " · ".join(amenities[:5]))

                    # Price
                    base = stay.get("price", 0)
                    price_display = round(base * 1.18) if include_tax else base
                    tax_note = "(18% GST included)" if include_tax else "+ taxes"
                    st.markdown(f"<div class='price-text'>₹{price_display:,} <span style='font-size:0.85rem; font-weight:normal; color:#777;'>/ night {tax_note}</span></div>", unsafe_allow_html=True)

                    # ── Guest Reviews Section ──
                    reviews = stay.get("reviews", [])
                    with st.expander(f"💬 Guest Reviews ({len(reviews)})"):
                        if reviews:
                            for rev in reviews:
                                st.markdown(f"""
                                <div class="review-bubble">
                                    <div class="review-author">{'⭐' * rev.get('rating', 5)} {rev.get('author')} <span style="font-size:0.75rem; color:#888;">· {rev.get('date', '')}</span></div>
                                    <div class="review-comment">"{rev.get('comment')}"</div>
                                </div>
                                """, unsafe_allow_html=True)
                        else:
                            st.caption("No reviews yet.")

                        # Add Review Form
                        st.markdown("**Write a Review:**")
                        with st.form(f"rev_form_{idx}"):
                            r_author = st.text_input("Your Name", placeholder="e.g. Aditi")
                            r_rating = st.selectbox("Rating", [5, 4, 3, 2, 1], index=0)
                            r_comment = st.text_area("Your Review", placeholder="Share your experience...")
                            if st.form_submit_button("Submit Review"):
                                if r_author and r_comment:
                                    if "reviews" not in stay:
                                        stay["reviews"] = []
                                    stay["reviews"].insert(0, {
                                        "author": r_author,
                                        "rating": r_rating,
                                        "comment": r_comment,
                                        "date": str(date.today())
                                    })
                                    st.success("Review posted successfully!")
                                    st.rerun()
                                else:
                                    st.error("Please provide both your name and review.")

                    # ── Reservation Expander ──
                    with st.expander("📅 Reserve this Stay"):
                        today = date.today()
                        c1, c2 = st.columns(2)
                        with c1:
                            cin = st.date_input("Check-In", value=today + timedelta(days=1), min_value=today, key=f"cin_{idx}")
                        with c2:
                            cout = st.date_input("Check-Out", value=today + timedelta(days=3), min_value=today + timedelta(days=1), key=f"cout_{idx}")

                        guests_count = st.selectbox("Guests", [1, 2, 3, 4, 5, 6], index=1, key=f"gst_{idx}")
                        nights = max(1, (cout - cin).days)
                        total_room = base * nights
                        cleaning = 600
                        tax_amt = round(total_room * 0.18)
                        grand = total_room + cleaning + tax_amt

                        st.write(f"**Stay Duration:** {nights} {'night' if nights == 1 else 'nights'}")
                        st.write(f"• Base rate: ₹{base:,} × {nights} = ₹{total_room:,}")
                        st.write(f"• Cleaning fee: ₹{cleaning:,}")
                        st.write(f"• 18% GST: ₹{tax_amt:,}")
                        st.markdown(f"### Total: ₹{grand:,}")

                        if st.button("Confirm Reservation", key=f"book_{idx}", type="primary"):
                            code = f"HS-{random.randint(100000, 999999)}"
                            st.session_state.bookings.insert(0, {
                                "code": code,
                                "title": stay.get("title"),
                                "location": stay.get("location"),
                                "check_in": str(cin),
                                "check_out": str(cout),
                                "nights": nights,
                                "guests": guests_count,
                                "total": grand,
                                "image": img_url
                            })
                            st.success(f"🎉 Reservation Confirmed! Booking Code: **{code}**")
                            st.rerun()

                st.markdown("---")

# ──────────────────────────── Tab 2: Map ────────────────────────────
with tab_map:
    st.markdown("### 🗺️ Locations Across India")
    points = []
    for s in filtered:
        g = s.get("geometry", {})
        if isinstance(g, dict) and "lat" in g and "lng" in g:
            points.append({
                "latitude": g["lat"],
                "longitude": g["lng"],
                "title": s.get("title"),
                "location": s.get("location"),
                "price": s.get("price")
            })

    if points:
        df = pd.DataFrame(points)
        st.map(df, latitude="latitude", longitude="longitude", size=25, color="#c9973a")
        st.dataframe(df[["title", "location", "price"]], use_container_width=True)

# ──────────────────────────── Tab 3: Reservations ────────────────────────────
with tab_res:
    st.markdown("### 📅 Your Bookings")
    if not st.session_state.bookings:
        st.info("No active reservations yet. Pick any stay from the 'Famous Stays' tab to reserve!")
    else:
        for b_idx, b in enumerate(st.session_state.bookings):
            with st.container():
                b1, b2, b3 = st.columns([1, 2.5, 1])
                with b1:
                    if b.get("image"):
                        st.image(b["image"], use_container_width=True)
                with b2:
                    st.markdown(f"#### {b['title']}")
                    st.caption(f"📍 {b['location']} · Reference: `{b['code']}`")
                    st.write(f"📅 **Dates:** {b['check_in']} to {b['check_out']} ({b['nights']} nights) · **Guests:** {b['guests']}")
                    st.markdown(f"**Total Paid:** ₹{b['total']:,}")
                with b3:
                    if st.button("Cancel Booking", key=f"cancel_{b_idx}"):
                        st.session_state.bookings.pop(b_idx)
                        st.warning(f"Booking {b['code']} cancelled.")
                        st.rerun()
            st.markdown("---")
