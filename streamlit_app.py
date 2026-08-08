import json
import os
import random
from datetime import date, timedelta
import pandas as pd
import streamlit as st

# ──────────────────────────── Page Config ────────────────────────────
st.set_page_config(
    page_title="StayFinder · Luxury Stays & Escapes",
    page_icon="🏖️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ──────────────────────────── Custom CSS ────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'DM Sans', sans-serif;
    }
    
    .main-header {
        background: linear-gradient(135deg, #3d2b1f 0%, #221710 100%);
        padding: 2.2rem 2rem;
        border-radius: 18px;
        color: #faf7f2;
        margin-bottom: 2rem;
        border: 1px solid #e8ddd0;
        box-shadow: 0 8px 30px rgba(61, 43, 31, 0.15);
    }
    
    .brand-title {
        font-family: 'Playfair Display', serif;
        font-size: 2.5rem;
        font-weight: 700;
        color: #faf7f2;
        margin: 0;
        letter-spacing: -0.01em;
    }
    
    .brand-title span {
        color: #c9973a;
    }
    
    .brand-sub {
        color: #d1c7bc;
        font-size: 1rem;
        margin-top: 0.4rem;
        font-weight: 300;
    }
    
    .stay-card {
        background: #ffffff;
        border: 1px solid #e8ddd0;
        border-radius: 16px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 18px rgba(61, 43, 31, 0.05);
        transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .stay-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 26px rgba(61, 43, 31, 0.12);
        border-color: #c9973a;
    }
    
    .badge-category {
        background: #f4ede3;
        color: #5c4738;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1px solid #e2d5c5;
        display: inline-block;
    }
    
    .stay-price-tag {
        font-size: 1.3rem;
        font-weight: 700;
        color: #3d2b1f;
    }
    
    .amenity-chip {
        background: #fbf9f5;
        border: 1px solid #e8ddd0;
        border-radius: 6px;
        padding: 3px 8px;
        font-size: 0.75rem;
        color: #5c4738;
        margin-right: 4px;
        margin-bottom: 4px;
        display: inline-block;
    }
    
    .reservation-box {
        background: #fbf9f5;
        border: 1px solid #ecdcc8;
        border-radius: 12px;
        padding: 1rem;
        margin-top: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# ──────────────────────────── Data Loader ────────────────────────────
@st.cache_data
def load_data():
    json_path = os.path.join(os.path.dirname(__file__), "data", "listings.json")
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

if "listings_data" not in st.session_state:
    st.session_state.listings_data = load_data()

if "reservations" not in st.session_state:
    st.session_state.reservations = []

# ──────────────────────────── Header Banner ────────────────────────────
st.markdown("""
<div class="main-header">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <div>
            <h1 class="brand-title">StayFinder<span>.</span></h1>
            <p class="brand-sub">Discover handpicked villas, alpine chalets, and historic havelis across 35+ iconic destinations worldwide.</p>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# ──────────────────────────── Sidebar Filters ────────────────────────────
st.sidebar.markdown("### 🔍 Filters & Search")

search_query = st.sidebar.text_input("Destination, stay name, or keyword", placeholder="e.g. Goa, Paris, Manali, Villa...")

categories = [
    "All", "Beach", "Mountains", "Luxury", "City", "Historical",
    "Castle", "Lake", "Forest", "Adventure", "Camping", "Desert",
    "Arctic", "Countryside", "Farm"
]
selected_category = st.sidebar.selectbox("Category", categories)

popular_dests = [
    "All Destinations", "Goa", "Manali", "Jaipur", "Udaipur", "Kerala",
    "Paris", "Santorini", "Swiss Alps", "Bali", "Kyoto", "Dubai", "New York", "Aspen"
]
selected_destination = st.sidebar.selectbox("Popular Destinations", popular_dests)

price_range = st.sidebar.slider(
    "Price per night (INR)",
    min_value=2000,
    max_value=30000,
    value=(2000, 30000),
    step=500
)

sort_option = st.sidebar.selectbox(
    "Sort By",
    ["Featured", "Price: Low to High", "Price: High to Low", "Top Rated"]
)

tax_toggle = st.sidebar.toggle("Include 18% GST in prices", value=False)

st.sidebar.markdown("---")
st.sidebar.markdown(f"**Total Stays Available:** {len(st.session_state.listings_data)}")
st.sidebar.markdown(f"**Active Bookings:** {len(st.session_state.reservations)}")

# ──────────────────────────── Filtering Logic ────────────────────────────
filtered_listings = []
for item in st.session_state.listings_data:
    # 1. Text Search
    if search_query:
        query = search_query.lower()
        title = item.get("title", "").lower()
        desc = item.get("description", "").lower()
        loc = item.get("location", "").lower()
        country = item.get("country", "").lower()
        cat = item.get("category", "").lower()
        if not (query in title or query in desc or query in loc or query in country or query in cat):
            continue

    # 2. Category Filter
    if selected_category != "All":
        if item.get("category") != selected_category:
            continue

    # 3. Destination Filter
    if selected_destination != "All Destinations":
        dest_q = selected_destination.lower()
        loc = item.get("location", "").lower()
        country = item.get("country", "").lower()
        if dest_q not in loc and dest_q not in country:
            continue

    # 4. Price Filter
    price = item.get("price", 0)
    if not (price_range[0] <= price <= price_range[1]):
        continue

    filtered_listings.append(item)

# ──────────────────────────── Sorting Logic ────────────────────────────
if sort_option == "Price: Low to High":
    filtered_listings.sort(key=lambda x: x.get("price", 0))
elif sort_option == "Price: High to Low":
    filtered_listings.sort(key=lambda x: x.get("price", 0), reverse=True)
elif sort_option == "Top Rated":
    filtered_listings.sort(key=lambda x: x.get("rating", 4.9), reverse=True)

# ──────────────────────────── Main Tabs ────────────────────────────
tab_explore, tab_map, tab_reservations, tab_add = st.tabs([
    f"🏨 Explore Stays ({len(filtered_listings)})",
    "🗺️ Interactive World Map",
    f"📅 My Reservations ({len(st.session_state.reservations)})",
    "➕ Host: Add New Stay"
])

# ──────────────────────────── Tab 1: Explore Stays ────────────────────────────
with tab_explore:
    if not filtered_listings:
        st.warning("No stays match your current filter criteria. Try adjusting the search or price slider.")
    else:
        # Display listings in 2-column responsive layout
        for i in range(0, len(filtered_listings), 2):
            cols = st.columns(2, gap="medium")
            for col_idx, item_idx in enumerate([i, i + 1]):
                if item_idx < len(filtered_listings):
                    item = filtered_listings[item_idx]
                    with cols[col_idx]:
                        with st.container():
                            img_url = item.get("image", {}).get("url") if isinstance(item.get("image"), dict) else item.get("image", "")
                            if img_url:
                                st.image(img_url, use_container_width=True)
                            
                            col_t1, col_t2 = st.columns([3, 1])
                            with col_t1:
                                st.markdown(f"### {item.get('title')}")
                                st.caption(f"📍 {item.get('location')}, {item.get('country')}")
                            with col_t2:
                                rating = item.get("rating", 4.9)
                                st.markdown(f"⭐ **{rating}**")
                                st.markdown(f"<span class='badge-category'>{item.get('category')}</span>", unsafe_allow_html=True)

                            st.write(item.get("description", ""))

                            # Amenities
                            amenities = item.get("amenities", [])
                            if amenities:
                                chips_html = " ".join([f"<span class='amenity-chip'>✓ {a}</span>" for a in amenities[:5]])
                                st.markdown(chips_html, unsafe_allow_html=True)

                            # Pricing
                            base_price = item.get("price", 0)
                            display_price = round(base_price * 1.18) if tax_toggle else base_price
                            tax_text = "(18% GST included)" if tax_toggle else "+ taxes"
                            st.markdown(f"<div class='stay-price-tag'>₹{display_price:,} <span style='font-size:0.85rem; font-weight:normal; color:#888;'>/ night {tax_text}</span></div>", unsafe_allow_html=True)

                            # Reservation Expander
                            with st.expander(f"📅 Check Availability & Reserve: {item.get('title')}"):
                                c_in, c_out = st.columns(2)
                                today = date.today()
                                with c_in:
                                    check_in = st.date_input("Check-In", value=today + timedelta(days=1), min_value=today, key=f"in_{item_idx}_{item.get('title')[:10]}")
                                with c_out:
                                    check_out = st.date_input("Check-Out", value=today + timedelta(days=4), min_value=today + timedelta(days=1), key=f"out_{item_idx}_{item.get('title')[:10]}")

                                guests = st.selectbox("Guests", options=[1, 2, 3, 4, 5, 6], index=1, key=f"g_{item_idx}_{item.get('title')[:10]}")

                                nights = max(1, (check_out - check_in).days)
                                subtotal = base_price * nights
                                cleaning_fee = 600
                                taxes = round(subtotal * 0.18)
                                grand_total = subtotal + cleaning_fee + taxes

                                st.markdown(f"""
                                <div class="reservation-box">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                        <span>₹{base_price:,} × {nights} {'night' if nights == 1 else 'nights'}</span>
                                        <strong>₹{subtotal:,}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                        <span>Cleaning fee</span>
                                        <span>₹{cleaning_fee:,}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                        <span>GST &amp; Service Tax (18%)</span>
                                        <span>₹{taxes:,}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 6px; font-size: 1.1rem; color: #3d2b1f;">
                                        <strong>Total Amount</strong>
                                        <strong style="color: #c9973a;">₹{grand_total:,}</strong>
                                    </div>
                                </div>
                                """, unsafe_allow_html=True)

                                if st.button("Confirm Reservation", key=f"btn_book_{item_idx}_{item.get('title')[:10]}", type="primary"):
                                    res_code = f"HS-{random.randint(100000, 999999)}"
                                    reservation_entry = {
                                        "code": res_code,
                                        "title": item.get("title"),
                                        "location": f"{item.get('location')}, {item.get('country')}",
                                        "check_in": str(check_in),
                                        "check_out": str(check_out),
                                        "nights": nights,
                                        "guests": guests,
                                        "total": grand_total,
                                        "image": img_url
                                    }
                                    st.session_state.reservations.insert(0, reservation_entry)
                                    st.success(f"🎉 Reservation confirmed! Booking Code: **{res_code}**")
                                    st.rerun()

                            st.markdown("---")

# ──────────────────────────── Tab 2: Map ────────────────────────────
with tab_map:
    st.markdown("### 🗺️ Explore Stays Worldwide")
    st.caption("All locations plotted using their verified geographic coordinates.")

    map_points = []
    for item in filtered_listings:
        geom = item.get("geometry", {})
        if isinstance(geom, dict) and "lat" in geom and "lng" in geom:
            map_points.append({
                "latitude": geom["lat"],
                "longitude": geom["lng"],
                "title": item.get("title"),
                "price": item.get("price"),
                "location": item.get("location")
            })

    if map_points:
        df_map = pd.DataFrame(map_points)
        st.map(df_map, latitude="latitude", longitude="longitude", size=20, color="#c9973a")
        st.dataframe(
            df_map[["title", "location", "price", "latitude", "longitude"]].rename(columns={"price": "Price (INR/night)"}),
            use_container_width=True
        )
    else:
        st.info("No coordinates available for current filter.")

# ──────────────────────────── Tab 3: Reservations ────────────────────────────
with tab_reservations:
    st.markdown("### 📅 Your Bookings & Itinerary")

    if not st.session_state.reservations:
        st.info("You don't have any active reservations yet. Browse stays in the 'Explore Stays' tab to book your dream escape!")
    else:
        for idx, res in enumerate(st.session_state.reservations):
            with st.container():
                r_c1, r_c2, r_c3 = st.columns([1, 3, 1])
                with r_c1:
                    if res.get("image"):
                        st.image(res["image"], use_container_width=True)
                with r_c2:
                    st.markdown(f"#### {res['title']}")
                    st.caption(f"📍 {res['location']} · Reference: `{res['code']}`")
                    st.write(f"**Dates:** {res['check_in']} to {res['check_out']} ({res['nights']} nights) · **Guests:** {res['guests']}")
                    st.markdown(f"**Total Paid:** ₹{res['total']:,} (taxes included)")
                with r_c3:
                    if st.button("Cancel Booking", key=f"cancel_{idx}_{res['code']}"):
                        st.session_state.reservations.pop(idx)
                        st.warning(f"Booking {res['code']} has been cancelled.")
                        st.rerun()
                st.markdown("---")

# ──────────────────────────── Tab 4: Host New Stay ────────────────────────────
with tab_add:
    st.markdown("### ➕ List a New Property on StayFinder")
    st.caption("Fill out the property specifications below to publish it instantly to the catalog.")

    with st.form("new_stay_form", clear_on_submit=True):
        col_f1, col_f2 = st.columns(2)
        with col_f1:
            new_title = st.text_input("Property Title *", placeholder="e.g. Hilltop Cloud Chalet & Private Deck")
            new_location = st.text_input("City / Region *", placeholder="e.g. Manali, Himachal Pradesh")
            new_price = st.number_input("Price per Night (INR) *", min_value=500, max_value=100000, value=4500, step=500)
            new_category = st.selectbox("Category *", [c for c in categories if c != "All"])
            new_guests = st.number_input("Max Guests", min_value=1, max_value=20, value=4)
        with col_f2:
            new_country = st.text_input("Country *", placeholder="e.g. India")
            new_img = st.text_input("Image URL *", value="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80")
            new_lat = st.number_input("Latitude", value=32.2530, format="%.4f")
            new_lng = st.number_input("Longitude", value=77.1750, format="%.4f")
            new_amenities = st.text_input("Amenities (comma separated)", value="High-speed Wifi, Mountain View, Indoor Fireplace, Free Parking")

        new_desc = st.text_area("Description *", placeholder="Describe your stay, views, and special amenities...")

        submitted = st.form_submit_button("Publish Listing to StayFinder", type="primary")
        if submitted:
            if not new_title or not new_location or not new_country or not new_desc:
                st.error("Please fill in all required fields marked with *.")
            else:
                new_listing = {
                    "title": new_title,
                    "description": new_desc,
                    "location": new_location,
                    "country": new_country,
                    "price": new_price,
                    "category": new_category,
                    "image": {"url": new_img},
                    "rating": 5.0,
                    "guests": new_guests,
                    "amenities": [a.strip() for a in new_amenities.split(",") if a.strip()],
                    "geometry": {"lat": new_lat, "lng": new_lng}
                }
                st.session_state.listings_data.insert(0, new_listing)
                st.success(f"🎉 **{new_title}** successfully published to StayFinder!")
                st.rerun()
