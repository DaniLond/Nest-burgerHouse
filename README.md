🍔 Nest-BurgerHouse

Members: 

- Leidy Daniela Londoño- A00392917
- Isabella Huila - A00394751

Burger House 

Contexto del problema: Burger House es un restaurante especializado en hamburguesas que busca optimizar la gestión de pedidos y mejorar la experiencia del cliente. Actualmente, la falta de un sistema integrado genera ineficiencias como retrasos en la preparación de los pedidos, errores de comunicación entre el personal y los clientes y una experiencia de compra poco fluida. Este proyecto pretende resolver estos problemas mediante una plataforma centralizada que permita a los clientes navegar por el menú, personalizar sus pedidos, hacerlos rápidamente y seguir su estado en tiempo real. Además, proporciona herramientas eficaces a los gestores y repartidores, mejorando la gestión interna y reduciendo los plazos de entrega.

Público objetivo:

Clientes: Aquellos que buscan una experiencia de pedido rápida y sin complicaciones.

Directores de restaurantes: Necesitan optimizar la gestión de pedidos y los tiempos de entrega.

Repartidores: Requieren un sistema organizado para recibir y completar las entregas, actualizar el estado de los pedidos.


Como correr el proyecto: 

1. clone the repository
```sh
   git clone https://github.com/DaniLond/Nest-burgerHouse.git
   cd Nest-burgerHouse
```
2. install the dependencies
```sh
  npm install
```

3. Compilar el código
```sh
  npm run start:dev
```
4. Correr los test 
   
  Primero instalar 
  ```sh
  npm install --save-dev jest ts-jest @types/jest typescript  
```
Finalmente ya podras correr las pruebas
```sh
 npm run test:cov  
```

5. Correr los test e2e
   
  Primero instalar 
  ```sh
  
```
Finalmente ya podras correr las pruebas
```sh

```


# Endpoints de la API


## Users

- **GET** `/seed-users`  
  Inicializa la base de datos con usuarios de prueba.

- **POST** `/users/register`  
  Registra un nuevo usuario en el sistema.

- **POST** `/users/login`  
  Autentica un usuario con sus credenciales.

- **GET** `/users`  
  Obtiene la lista de todos los usuarios registrados.

- **GET** `/users/:email`  
  Obtiene la información de un usuario específico por su correo electrónico.  
  _Ejemplo_: `/users/marcela@gmail.com`

- **GET** `/users/profile`  
  Devuelve el perfil del usuario autenticado.

## Products

## Products

- **GET** `/seed-products`  
  Inicializa la base de datos con productos de prueba.

- **GET** `/products`  
  Obtiene la lista de todos los productos disponibles.

- **GET** `/products/:name`  
  Obtiene la información de un producto específico por su nombre.  
  _Ejemplo_: `/products/Chicken Burger`

- **POST** `/products/create-product`  
  Crea un nuevo producto en el sistema.

- **PATCH** `/products/:name`  
  Actualiza la información de un producto existente.  
  _Ejemplo_: `/products/Onion Rings`

- **DELETE** `/products/:name`  
  Elimina un producto específico del sistema.  
  _Ejemplo_: `/products/Cheese Burger`

##Toppings

- **GET** `/seed-toppings`  
  Inicializa la base de datos con toppings de prueba.

- **GET** `/toppings`  
  Obtiene la lista de todos los toppings disponibles.

- **GET** `/toppings/:name`  
  Obtiene la información de un topping específico por su nombre.  
  _Ejemplo_: `/toppings/Extra Cheese`

- **POST** `/toppings`  
  Crea un nuevo topping en el sistema.

- **PATCH** `/toppings/:name`  
  Actualiza la información de un topping existente.  
  _Ejemplo_: `/toppings/Pimenton`

- **DELETE** `/toppings/:name`  
  Elimina un topping específico del sistema.  
  _Ejemplo_: `/toppings/Pimenton`

- **POST** `/toppings/add-topping`  
  Asocia un topping a un producto.

- **DELETE** `/toppings/remove-topping/:id`  
  Elimina la asociación entre un topping y un producto por ID.  
  _Ejemplo_: `/toppings/remove-topping/9ab1a92f-d5c1-4b9b-8b45-0c5321c2e70a`




## Orders

- **GET** `/seed-orders`  
  Inicializa la base de datos con órdenes de prueba.

- **GET** `/Orders`  
  Obtiene la lista de todas las órdenes.

- **GET** `/Orders/:id`  
  Obtiene la información de una orden específica por su ID.  
  _Ejemplo_: `/orders/df3d1fd5-cc1d-407e-9c46-e9672fff86b0`

- **POST** `/Order`  
  Crea una nueva orden en el sistema.

- **PATCH** `/Orders/:id`  
  Actualiza el estado de una orden específica.  
  _Ejemplo_: `/orders/3152ce00-1a66-4b77-96ed-0b9a198f78c5`

- **DELETE** `/Orders/:id`  
  Elimina una orden específica del sistema.  
  _Ejemplo_: `/orders/df3d1fd5-cc1d-407e-9c46-e9672fff86b0`

## Reports

- **GET** `/reports/sales/daily`  
  Obtiene el reporte de ventas diarias.

- **GET** `/reports/sales/weekly`  
  Obtiene el reporte de ventas semanales.

- **GET** `/reports/sales/monthly`  
  Obtiene el reporte de ventas mensuales.

- **GET** `/reports/products/top-selling/daily`  
  Obtiene el reporte diario de los productos más vendidos.

- **GET** `/reports/products/top-selling/weekly`  
  Obtiene el reporte semanal de los productos más vendidos.

- **GET** `/reports/products/top-selling/monthly`  
  Obtiene el reporte mensual de los productos más vendidos.
