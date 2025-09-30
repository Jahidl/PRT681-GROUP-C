# CSV Product Upload Guide

This guide explains how to use the CSV upload feature in the admin dashboard to bulk upload products.

## CSV Format

The CSV file must contain the following columns in this exact order:

| Column         | Required | Type        | Description                    | Example                                         |
| -------------- | -------- | ----------- | ------------------------------ | ----------------------------------------------- |
| Id             | Yes      | String      | Unique product identifier      | `basketball-pro-1`                              |
| Name           | Yes      | String      | Product name                   | `Professional Basketball`                       |
| Description    | No       | String      | Product description            | `High-quality basketball for professional play` |
| Price          | Yes      | Decimal     | Product price                  | `99.99`                                         |
| OriginalPrice  | No       | Decimal     | Original price (for discounts) | `129.99`                                        |
| CategoryId     | Yes      | String      | Category identifier            | `team-sports`                                   |
| SubcategoryId  | No       | String      | Subcategory identifier         | `basketball`                                    |
| Brand          | Yes      | String      | Brand name                     | `Nike`                                          |
| Rating         | No       | Number      | Product rating (0-5)           | `4.5`                                           |
| ReviewCount    | No       | Integer     | Number of reviews              | `150`                                           |
| InStock        | No       | Boolean     | Is product in stock            | `true`                                          |
| StockCount     | No       | Integer     | Stock quantity                 | `100`                                           |
| Images         | No       | JSON Array  | Product image URLs             | `["image1.jpg","image2.jpg"]`                   |
| Features       | No       | JSON Array  | Product features               | `["Durable","Waterproof"]`                      |
| Specifications | No       | JSON Object | Product specifications         | `{"Material":"Leather","Size":"Official"}`      |
| Tags           | No       | JSON Array  | Product tags                   | `["sports","basketball","professional"]`        |
| Sizes          | No       | JSON Array  | Available sizes                | `["S","M","L","XL"]`                            |
| Colors         | No       | JSON Array  | Available colors               | `["Red","Blue","Black"]`                        |
| IsActive       | No       | Boolean     | Is product active              | `true`                                          |

## Sample CSV Content

```csv
Id,Name,Description,Price,OriginalPrice,CategoryId,SubcategoryId,Brand,Rating,ReviewCount,InStock,StockCount,Images,Features,Specifications,Tags,Sizes,Colors,IsActive
basketball-pro-1,Professional Basketball,High-quality basketball for professional play,99.99,129.99,team-sports,basketball,Nike,4.5,150,true,100,"[""basketball1.jpg"",""basketball2.jpg""]","[""Official size"",""Durable leather""]","{""Material"":""Leather"",""Size"":""Official"",""Weight"":""22oz""}","[""basketball"",""sports"",""professional""]",,,"[""Orange"",""Brown""]",true
running-shoes-1,Running Shoes,Comfortable running shoes for daily training,79.99,99.99,fitness,running,Adidas,4.2,89,true,50,"[""shoes1.jpg"",""shoes2.jpg""]","[""Breathable mesh"",""Cushioned sole""]","{""Material"":""Mesh"",""Type"":""Running""}","[""running"",""fitness"",""shoes""]","[""7"",""8"",""9"",""10"",""11""]","[""Black"",""White"",""Blue""]",true
```

## Important Notes

1. **Required Fields**: Id, Name, CategoryId, Brand, and Price must be filled for every row
2. **JSON Fields**: Images, Features, Specifications, Tags, Sizes, and Colors must be valid JSON format
3. **Boolean Fields**: Use `true` or `false` (lowercase)
4. **Categories**: Make sure CategoryId and SubcategoryId exist in your system before uploading
5. **Quotes**: Use double quotes around JSON strings and escape inner quotes with `""`
6. **File Format**: Save as CSV with UTF-8 encoding

## Steps to Upload

1. Go to Admin Dashboard
2. Click "Upload Products CSV" button
3. Download the template if needed
4. Prepare your CSV file following the format above
5. Upload your CSV file
6. Review the upload results
7. Check for any errors and fix them if needed

## Error Handling

The system will validate each row and report:

- Missing required fields
- Invalid JSON format
- Non-existent categories/subcategories
- Duplicate product IDs
- Data type mismatches

Failed rows will be skipped, and successful rows will be imported. You can fix the errors and re-upload the failed rows.
