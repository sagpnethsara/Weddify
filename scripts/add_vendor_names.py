import pandas as pd

VENDOR_NAMES = {
    'Catering': [
        'Suwandha Catering', 'Rasa Catering', 'Flavours of Ceylon', 'Thisara Catering',
        'Spice Garden Catering', 'Regal Feast Catering', 'Lakshmi Catering House',
        'Golden Spoon Catering', 'Royal Kitchen Catering', 'Savor Lanka Catering',
        'Araliya Catering', 'Sudu Nelum Catering', 'Heritage Catering Lanka',
        'Danidu Catering', 'Prasanna Catering Services', 'Pearl Catering',
        'Amoda Catering', 'Nayana Catering', 'Sunrise Catering Lanka', 'Dinemore Catering',
        'Chaminda Catering', 'Nishantha Catering House', 'Sanda Catering Lanka',
        'Royal Feast Catering', 'Malini Catering Services', 'Premasiri Catering',
        'Samitha Catering', 'Nelum Catering Lanka', 'Anoma Catering House', 'Ceylon Feast',
    ],
    'Decorators': [
        'Bloom & Blossom Decor', 'Lotus Flower Decorators', 'Enchanted Events Lanka',
        'Radiant Decor Studio', 'Serenity Decorators', 'Sapphire Decor Lanka',
        'Dream Decor Creations', 'Nelum Decorators', 'Elegant Touch Decor',
        'Celebration Craft Lanka', 'Glow Events Decor', 'Petal & Vine Decorators',
        'Royal Elegance Decor', 'Ivory & Gold Decorators', 'Nimasha Decor Studio',
        'Sandya Decorators', 'Lush Floral Decor', 'Paradise Decor Lanka',
        'Kasun Decorators', 'Starlight Decor Events', 'Malsha Event Decor',
        'Sethum Decorators', 'Regal Bloom Decor', 'Amara Decor Lanka',
        'Floral Bliss Decorators', 'Thisaru Decor Studio', 'Eden Event Decor',
        'Chamara Decorators', 'Luxe Decor Lanka', 'Pristine Event Decor',
    ],
    'Attire & Beauty': [
        'Sithara Bridal Studio', 'Ayomi Bridal Boutique', 'Silk & Grace Atelier',
        'Chamara Beauty Studio', 'Radiant Bride Lanka', 'Mihiri Bridal Couture',
        'Thilini Beauty Salon', 'Pearls & Lace Boutique', 'Ama Bridal Studio',
        'Nisha Bridal Collections', 'Dilini Makeup & Bridal', 'Suranga Bridal House',
        'Lakshika Bridal Atelier', 'Bloom Bridal Studio', 'Divya Beauty Lounge',
        'Hasini Bridal Fashion', 'Kavisha Beauty Studio', 'Dulari Bridal World',
        'Seyli Bridal Couture', 'Glam Lanka Bridal Studio', 'Nimasha Bridal Studio',
        'Malki Beauty Lounge', 'Anusha Bridal Collections', 'Golden Drape Atelier',
        'Regal Bridal Lanka', 'Sandali Beauty Studio', 'Thisara Bridal House',
        'Amali Makeup Studio', 'Dewmi Bridal Couture', 'Pearl Glow Beauty',
    ],
    'Photographers': [
        'Moments by Kasun', 'Nuwan Photography', 'Forever Frames Lanka',
        'Lens & Light Studio', 'Prism Photography Lanka', 'Capture Ceylon',
        'Thisara Visual Studio', 'Milestone Photography', 'Golden Hour Lanka',
        'Shutter & Soul Photography', 'Sachith Photography', 'Frame Perfect Lanka',
        'Vision Studio Lanka', 'Eternity Shots', 'Dimuth Photography',
        'Candid Moments Lanka', 'Infinite Lens Studio', 'Ravindu Photography',
        'Nalin Visual Arts', 'Crystal Clear Photography', 'Chaminda Lens Studio',
        'True Story Photography', 'Amara Frames Lanka', 'Glimpse Photography',
        'Regal Capture Lanka', 'Suresh Visual Studio', 'Dawn Light Photography',
        'Imara Lens Works', 'Sandun Photography', 'Vivid Moments Lanka',
    ],
    'Entertainment': [
        'Rhythm Lanka Band', 'Starlight Entertainment', 'Melody Makers Lanka',
        'Live Beat Productions', 'Serenade Entertainment', 'Harmony Events Lanka',
        'Crescendo Band Lanka', 'Sunil Perera Entertainment', 'Groove Island Band',
        'Celebration Sounds Lanka', 'Pulse Entertainment', 'Royal Melodies Lanka',
        'Alegria Entertainment', 'DJ Kasun Events', 'Island Beats Lanka',
        'Soundwave Entertainment', 'Premier Events Lanka', 'Euphoria Band Lanka',
        'Gala Events Sri Lanka', 'Fiesta Entertainment Lanka', 'Nirosha Band Lanka',
        'Vibrance Entertainment', 'Maestro Events Lanka', 'Silver Note Band',
        'Kadamba Entertainment', 'Tempo Lanka Band', 'Vibe Events Lanka',
        'Islandwide Entertainment', 'Fusion Beats Lanka', 'Shanth Entertainment',
    ],
    'Wedding Cakes': [
        'Sweet Creations Lanka', 'Bake House Colombo', 'Sugared Bliss Cakes',
        'The Cake Studio Lanka', 'Nilmini Cake Designs', 'Fondant Dreams Lanka',
        'Butter & Bloom Cakes', 'Celebrate Cakes Lanka', 'Thisari Cake Studio',
        'Elegant Tier Cakes', 'Delice Cake Lanka', 'Siyara Cake Creations',
        'Patisserie Ceylon', 'Whisk & Frost Lanka', 'Bloom Cake Studio',
        'Amora Cake Boutique', 'Anoma Cake House', 'Sweet Layers Lanka',
        'Sugar & Spice Cakes Lanka', 'Cloud Nine Cakes', 'Kaushi Cake Studio',
        'Velvet Crumb Cakes', 'Island Sweet Creations', 'Regal Tier Cakes',
        'Chamindi Cake House', 'Blossom Bake Studio', 'Delight Cakes Lanka',
        'Malisha Cake Designs', 'Sundara Cake Studio', 'Royal Icing Lanka',
    ],
    'Wedding Cars': [
        'Luxury Rides Lanka', 'Royal Motor Weddings', 'Classic Ceylon Cars',
        'Premium Wheels Lanka', 'Elegance Auto Lanka', 'White Rose Limo Lanka',
        'Prestige Cars Lanka', 'Ceylon Classic Car Hire', 'Crown Motor Services',
        'Grand Arrival Lanka', 'Sterling Car Hire Lanka', 'Rolls Lanka Motors',
        'Savoy Car Services', 'Bridal Wheels Lanka', 'Diamond Drive Lanka',
        'Noble Fleet Lanka', 'Chauffeur Lanka', 'Classy Auto Weddings',
        'Forever Drive Lanka', 'Ivory Wheels Lanka', 'Serendib Auto Lanka',
        'First Class Limo Lanka', 'Prestige Drive Lanka', 'Crystal Car Hire',
        'Viceroy Motors Lanka', 'Graceful Rides Lanka', 'Elite Fleet Lanka',
        'Suyama Car Services', 'Bridal Fleet Lanka', 'Pearl Auto Lanka',
    ],
    'Wedding Invitations': [
        'Artisan Cards Lanka', 'Paper & Petals Lanka', 'Ink & Ivory Invitations',
        'Chitra Stationery Studio', 'Ornate Invites Lanka', 'Nimali Design Studio',
        'Blush Print Lanka', 'Royal Script Invitations', 'Eden Stationery Lanka',
        'Gold Leaf Invitations', 'Velvet Touch Cards Lanka', 'Lakna Print Studio',
        'Crafted With Love Lanka', 'Elegance Print Lanka', 'Rustic Charm Invites',
        'Bloom Stationery Lanka', 'Pearl Paper Studio', 'Script & Seal Lanka',
        'Forever Ink Invitations', 'Sunrise Print Lanka', 'Lace & Letter Lanka',
        'Regal Print Studio', 'Sanda Stationery Lanka', 'Heritage Invites Lanka',
        'Amara Paper Works', 'Ceylon Script Studio', 'Calligraphy Lanka',
        'Bespoke Invites Lanka', 'Kantha Print Lanka', 'Bloom & Write Lanka',
    ],
    'Venues': [
        'The Grand Pavilion Lanka', 'Crystal Ballroom Lanka', 'Lotus Garden Venue',
        'Pearl Hall Colombo', 'Serenity Resort Venue', 'Emerald Garden Lanka',
        'The Royal Banquet Hall', 'Sapphire Banquet Lanka', 'Island Paradise Venue',
        "Heaven's Gate Venue", 'The Orchid Hall Lanka', 'Nilaveli Bay Resort',
        'Lakeside Manor Lanka', 'The Terrace Venue Lanka', 'Ivory Castle Hall',
        'Gardenia Venue Lanka', 'Blue Horizon Hall', 'Thilina Banquet Hall',
        'The Heritage Hall Lanka', 'Sandagiri Venue Lanka', 'Golden Palm Venue',
        'Cinnamon Gardens Hall', 'The Manor Lanka', 'Lakeview Banquet Lanka',
        'Regal Gardens Lanka', 'Jasmine Hall Lanka', 'Sunset Venue Lanka',
        'The Pavilion Lanka', 'Amara Banquet Hall', 'Grand Ceylon Venue',
    ],
}
DEFAULT_NAMES = [
    'Weddify Partner', 'Premier Wedding Services', 'Elite Weddings Lanka',
    'Ceylon Wedding Co', 'Grand Wedding Lanka', 'Bloom Wedding Services',
]


def generate_name(category, row_index):
    names = VENDOR_NAMES.get(category, DEFAULT_NAMES)
    return names[row_index % len(names)]


def main():
    path = '../data/weddify_dataset_v_final.csv'
    df = pd.read_csv(path)

    if 'vendor_name' in df.columns:
        print('vendor_name column already exists — overwriting.')

    counters = {}
    names = []
    for cat in df['Category']:
        idx = counters.get(cat, 0)
        names.append(generate_name(cat, idx))
        counters[cat] = idx + 1

    df.insert(0, 'vendor_name', names)
    df.to_csv(path, index=False)
    print(f'Done. Added vendor_name to {len(df)} rows.')
    print(df[['vendor_name', 'Category']].head(10).to_string())


if __name__ == '__main__':
    main()
