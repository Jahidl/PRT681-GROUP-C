# .NET 9 API - multi-stage build

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# copy csproj and restore as distinct layers
COPY ECommerce.Api.csproj ./
RUN dotnet restore "ECommerce.Api.csproj"

# copy everything else and build
COPY . .
RUN dotnet publish "ECommerce.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Configure ASP.NET Core to listen on 8080 inside the container
ENV ASPNETCORE_URLS=http://+:8080

# Set environment (override in compose as needed)
ENV ASPNETCORE_ENVIRONMENT=Development

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "ECommerce.Api.dll"]
