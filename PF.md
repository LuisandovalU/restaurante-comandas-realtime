

# **INSTITUTO POLITÉCNICO NACIONAL UNIDAD PROFESIONAL INTERDISCIPLINARIA DE INGENIERÍA Y**

# **CIENCIAS SOCIALES Y ADMINISTRATIVAS**

**Ingeniería en Informática**

**Ingenieria de Diseño**

#                                                      **PROYECTO FINAL:    INGENIERÍA DE DISEÑO**

#                            


                           

## 

## 

## 

**Índice**  
\[Marcador de posición para Índice Automático\]

# 

# 

# 

# 

# 

# 

# 

# 

# 

# 

# 

# 

# 

# 

# 

# **Resumen / Abstract**

### **Resumen**

El presente proyecto documenta el análisis, diseño y desarrollo de un Sistema de Gestión de Comandas en Tiempo Real para el restaurante "El Rincón del Parque". La problemática principal identificada en el establecimiento radica en la dependencia de tickets de papel y sistemas anticuados, lo que provoca pérdida de comandas, mala comunicación entre los meseros y la cocina, y una evidente falta de visibilidad operativa.

Para solucionar estos puntos de dolor, se propone una aplicación web basada en una interfaz de tablero Kanban interactivo que permite gestionar el flujo de trabajo mediante *Drag and Drop* bajo tres estados: Pendiente, En preparación y Listo. Tecnológicamente, el sistema rompe con enfoques tradicionales al implementar un *stack* moderno, rápido y gratuito: **TanStack Start** para la interfaz web, **Convex** como *Backend as a Service* (BaaS) que garantiza sincronización instantánea y autenticación integrada, **Bun** como entorno de ejecución veloz, **Biome** para el formateo, y **Railway** para el despliegue en la nube. Adicionalmente, el diseño del software cumple con los requerimientos académicos al estructurarse bajo una **arquitectura en capas**, incorporar el **patrón Microkernel** para permitir modularidad sin afectar el núcleo del sistema, e integrar un **micrositio** funcional complementario.

### **Abstract**

This project documents the analysis, design, and development of a Real-Time Order Management System for the restaurant "El Rincón del Parque". The primary problem identified in the establishment is its reliance on paper tickets and outdated digital systems, which leads to lost orders, poor communication between waiters and the kitchen staff, and a noticeable lack of operational visibility.

To address these pain points, a web application based on an interactive Kanban board interface is proposed, allowing users to manage the workflow via Drag and Drop across three states: Pending, In Preparation, and Ready. Technologically, the system breaks away from traditional approaches by implementing a modern, fast, and free stack: **TanStack Start** for the web interface, **Convex** as a Backend as a Service (BaaS) guaranteeing instant real-time synchronization and built-in authentication, **Bun** as a high-speed runtime environment, **Biome** for code formatting, and **Railway** for cloud deployment. Additionally, the software design complies with academic requirements by being structured under a **layered architecture**, incorporating the **Microkernel pattern** to allow modularity without affecting the system's core, and integrating a complementary, functional **microsite**.

# 

# **Introducción**

En la actualidad, el sector restaurantero exige un alto nivel de dinamismo y precisión para garantizar una experiencia satisfactoria al cliente. La operatividad diaria de un establecimiento gastronómico depende en gran medida de la sincronización exacta entre el personal de servicio (meseros) y el área de preparación (cocina). Sin embargo, muchos negocios aún dependen de métodos analógicos o herramientas digitales obsoletas que merman su eficiencia.

Este es el caso del restaurante "El Rincón del Parque", un establecimiento que actualmente enfrenta un importante desafío operativo. El proceso de gestión de pedidos se realiza mediante tickets físicos y un sistema digital carente de reactividad, lo que frecuentemente resulta en la pérdida de comandas, interrupciones constantes en la cocina y retrasos en la entrega de los alimentos. Ante esta problemática, surge la necesidad de diseñar e implementar una solución de software que optimice el flujo de trabajo y proporcione visibilidad en tiempo real del estado de cada orden.

El presente documento detalla el diseño, desarrollo y pruebas de un **Sistema de Gestión de Comandas en Tiempo Real**. La solución propuesta consiste en una aplicación web interactiva que utiliza una interfaz gráfica basada en un tablero Kanban. Esta herramienta permitirá a los cocineros y meseros actualizar el estado de los platillos (Pendiente, En preparación y Listo) mediante acciones intuitivas de arrastrar y soltar (*Drag and Drop*), garantizando una sincronización instantánea en todas las pantallas del local sin necesidad de recargar el sistema.

Para lograr este nivel de eficiencia, el proyecto se aleja de los *stacks* de desarrollo tradicionales y adopta un conjunto de tecnologías modernas, veloces y de uso gratuito. El sistema web está construido con **TanStack Start** en el *frontend* , respaldado por **Convex** como *Backend as a Service* (BaaS) para manejar la base de datos en tiempo real y la autenticación de usuarios. Además, se utiliza **Bun** como entorno de ejecución de alto rendimiento, **Biome** para el control de calidad del código y **Railway** para el despliegue en la nube.

Desde la perspectiva de la Ingeniería de Diseño de Software, el proyecto no solo resuelve un problema de negocio, sino que cumple con rigurosos estándares académicos. La solución se estructura bajo una **Arquitectura en Capas** para separar la presentación de la lógica de negocio y el acceso a datos. Asimismo, implementa el **Patrón Microkernel**, permitiendo que el núcleo del sistema reciba los pedidos y ejecute un algoritmo de priorización, delegando la visualización en cocina y la facturación a módulos independientes (Plugins) que incluso manejan persistencia de datos mixta (SQL y NoSQL). Finalmente, el ecosistema se complementa con el desarrollo de un **micrositio** informativo que aporta valor adicional al modelo de negocio.

A lo largo de los siguientes capítulos, se expondrá a detalle la ingeniería de requerimientos, el modelado de bases de datos, los diagramas arquitectónicos y las evidencias de las pruebas que validan el correcto funcionamiento de este sistema.

* **Proyecto:** Sistema de Gestión de Comandas en Tiempo Real.  
* **Cliente:** Restaurante "El Rincón del Parque".  
* **Ubicación:** Matías Romero 1114, Col del Valle Centro, Benito Juárez, 03100 Ciudad de México, CDMX.  
* **Entrevistador:** Analista de Requerimientos (Equipo de Diseño de Software).  
* **Entrevistado:** Gerente de Operaciones del Restaurante.  
* **Fecha de la entrevista:** 1 junio 2026\.  
* **Stack Tecnológico:** TanStack Start, Convex, Bun, Biome, Railway

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### **Hallazgos Clave (Puntos de Dolor Identificados)**

1. **Uso de sistemas anticuados que requieren actualización manual.**  
2. **Pérdida de comandas y falta de visibilidad operativa.**  
3. **Pérdida de tiempo por parte de los meseros al consultar el estado de los platillos.**  
4. **Necesidad de un flujo de trabajo simplificado (Pendiente \> En preparación \> Listo).**

## 

# **Desarrollo del proyecto**

## **1\. Análisis del Problema**

### **Descripción general de la empresa o negocio**

El proyecto se desarrolla para el sector restaurantero, específicamente enfocado en la operatividad de la cocina y la gestión de atención al cliente. Un restaurante requiere sincronización exacta entre los meseros que toman la orden y los cocineros que la preparan.

### **Problemática detectada**

En muchos restaurantes, la gestión de pedidos (comandas) se realiza mediante tickets de papel o sistemas digitales anticuados que requieren recargar la página para ver actualizaciones. Esto genera pérdida de tickets, mala comunicación entre el personal, retrasos en la preparación de los alimentos y falta de visibilidad sobre el estado actual de cada pedido por parte de los administradores.

### **Justificación del proyecto**

El desarrollo de este sistema se justifica por la necesidad de contar con una herramienta visual, rápida y colaborativa. Se propone utilizar un stack tecnológico alternativo y moderno compuesto por TanStack Start, Convex, Bun y Railway. Convex proporciona sincronización en tiempo real por defecto, lo que garantiza que cualquier cambio de estado en un pedido (de "pendiente" a "listo") se refleje instantáneamente en las pantallas de todos los usuarios sin latencia. Además, el uso de Bun y Biome optimiza el rendimiento y los tiempos de desarrollo.

### 

### 

### **Objetivo general**

Desarrollar una aplicación web en tiempo real para la gestión visual de comandas de un restaurante, permitiendo la administración del menú y el seguimiento del estado de los pedidos mediante una interfaz tipo Kanban.

### **Objetivos específicos**

* Diseñar una interfaz de usuario basada en un tablero Kanban para visualizar los pedidos.  
* Implementar un sistema de autenticación de usuarios mediante correo y contraseña utilizando los servicios integrados de Convex.  
* Desarrollar un módulo de administración de platos que permita registrar el nombre, descripción, precio y tiempo de preparación.  
* Configurar el despliegue automático del frontend utilizando la plataforma Railway.

### **Alcances y limitaciones del sistema**

* **Alcance:** El sistema permitirá la autenticación de personal, la creación de nuevos platos en el menú y la actualización del estado de los pedidos en tiempo real mediante Drag and Drop.  
* **Limitaciones:** El sistema actual no incluirá un módulo de facturación, control de inventario de materia prima ni procesamiento de pagos. Se requiere conexión a internet permanente para la funcionalidad en tiempo real.

## 

## 

## 

## 

## 

## 

## **2\. Ingeniería de Requerimientos**

### 

### **Requerimientos Funcionales**

* **RF-01 (Autenticación):** El sistema debe permitir el registro e inicio de sesión de usuarios mediante correo y contraseña, redireccionando a los usuarios no autenticados a la pantalla de login.  
* **RF-02 (Gestión de Menú):** El sistema debe contar con una sección de administración para registrar y visualizar platos.  
* **RF-03 (Tablero Kanban):** El sistema debe mostrar un tablero con columnas que representen los estados de los pedidos.  
* **RF-04 (Actualización de Estado):** El sistema debe permitir cambiar el estado de un pedido arrastrando y soltando la tarjeta (Drag and Drop) entre las columnas del tablero.  
* **RF-05 (Sincronización):** Los cambios realizados en el tablero de pedidos deben reflejarse de manera automática e instantánea en todas las sesiones activas.

### 

### **Requerimientos No Funcionales**

* **RNF-01 (Arquitectura del Frontend):** La interfaz web debe estar construida utilizando el framework TanStack Start para optimizar el renderizado.  
* **RNF-02 (Base de datos y Backend):** La persistencia de datos y la comunicación web socket deben gestionarse mediante Convex (Backend as a Service).  
* **RNF-03 (Entorno de ejecución):** El proyecto debe utilizar Bun como entorno de ejecución y administrador de paquetes para mejorar la velocidad.  
* **RNF-04 (Disponibilidad):** La aplicación cliente debe estar alojada en la nube mediante Railway para asegurar acceso continuo.

### 

### 

### 

### 

### 

### **Reglas de negocio**

* **RN-01:** Un pedido solo puede transitar por tres estados definidos: Pendiente, En preparación y Listo.  
* **RN-02:** El acceso a la visualización del tablero Kanban está estrictamente restringido a usuarios registrados e iniciados en el sistema.

### 

### 

### **Historias de usuario**

* **HU-01:** Como administrador, quiero registrar nuevos platos en la sección de administración para mantener el menú actualizado.  
* **HU-02:** Como cocinero, quiero visualizar los pedidos entrantes en una columna de "Pendientes" para saber qué debo empezar a preparar.  
* **HU-03:** Como cocinero, quiero arrastrar la tarjeta de un pedido a la columna "En preparación" para informar a los meseros que el plato ya se está cocinando.  
* **HU-04:** Como mesero, quiero ver en tiempo real cuando un plato cambia a estado "Listo" para entregarlo inmediatamente al cliente sin tener que preguntar a la cocina.

### **Casos de Uso Principales**

* **CU-01 (Iniciar Sesión):** El actor ingresa sus credenciales; el sistema valida con Convex y otorga acceso al tablero.  
* **CU-02 (Administrar Platos):** El actor ingresa al módulo de administración y guarda un documento JSON con los datos del plato (nombre, precio, disponibilidad) en la base de datos.  
* **CU-03 (Actualizar Comanda):** El actor selecciona un pedido en el tablero Kanban y lo mueve a otra columna. El sistema actualiza el estado en la tabla de Convex y emite el cambio a todos los clientes conectados.

# 

# 

# 

## **3\. Diseño de la Arquitectura del Sistema**

Para enfrentar los retos de operatividad del restaurante "El Rincón del Parque" y evitar los problemas comunes del desarrollo improvisado (como la alta dependencia entre módulos y código difícil de modificar), el diseño arquitectónico se fundamenta en soluciones probadas. Se ha optado por un enfoque híbrido que combina la estructuración horizontal, la modularidad de componentes y la reactividad en tiempo real.

### **3.1 Diseño de Patrón por Capas (Layered Architecture)**

Como base estructural, se adoptó el diseño de patrón por capas para organizar el sistema en grupos lógicos horizontales. Este modelo promueve la modularidad, garantizando que la comunicación fluya en una sola dirección jerárquica (descendente) y actuando cada capa como un módulo autónomo:

* **Capa de Presentación:** Construida con el framework moderno *TanStack Start*, es responsable de la interfaz gráfica (tablero Kanban) con la que interactúan cocineros y meseros.  
* **Capa de Lógica de Negocio:** Es el "cerebro" del sistema donde residen las reglas operativas y los algoritmos de enrutamiento y cálculo de tiempos de preparación. Recibe peticiones de la capa superior, las procesa y delega.  
* **Capa de Acceso a Datos y Persistencia:** Diseñada bajo un esquema de "Persistencia Políglota", esta capa gestiona la conexión bidireccional hacia una base de datos relacional (SQL) para la gestión formal de tickets/facturación, y una no relacional (Convex / NoSQL) para el manejo de estados en la cocina.

### **3.2 Patrón Microkernel (Plug-in Architecture)**

Para lograr un sistema altamente extensible sin alterar su código base, la arquitectura se dividió utilizando el Patrón Microkernel. Esto permite separar las operaciones financieras de la lógica ágil de la cocina.

* **Core System (Núcleo):** Contiene la funcionalidad mínima funcional e indispensable. Se encarga de recibir la comanda original del mesero, aplicar el algoritmo de clasificación por estación (Fríos, Calientes, Postres) y gestionar la comunicación central.  
* **Plug-in Modules:** Componentes independientes que añaden funcionalidades especializadas y son intercambiables sin afectar al núcleo:  
  * *Plug-in de Cocina:* Un módulo NoSQL (Convex) optimizado para la lectura rápida y actualización de documentos JSON que renderizan el tablero Kanban.  
  * *Plug-in de Facturación:* Un módulo SQL tradicional responsable de procesar transacciones ACID (cálculo de impuestos, sumatorias y generación de folios).

### **3.3 Arquitectura Dirigida por Eventos (EDA)**

Dado que el restaurante requiere sincronización inmediata, el sistema integra conceptos de *Event-Driven Architecture (EDA)*. A diferencia de los modelos tradicionales basados en solicitudes y respuestas (request-response) que obligan a recargar la página, este sistema reacciona a cambios significativos de estado.

Cuando un cocinero arrastra un pedido (*Drag and Drop*) de la columna "En Preparación" a "Listo", el frontend no envía una solicitud aislada; en su lugar, **se emite un evento**. Los demás componentes del sistema (como las pantallas de los meseros) que están interesados en este evento, lo reciben a través del backend de Convex y reaccionan de forma autónoma actualizando su interfaz en tiempo real, garantizando así un sistema altamente reactivo.

### 

### 

### 

### 

### 

### 

### 

### **3.4 Aplicación de Patrones de Comportamiento**

Para la lógica interna del Core System, se formalizó el uso de patrones de diseño de comportamiento establecidos por el estándar de la ingeniería de software:

* **Patrón Strategy (Estrategia):** Se utiliza para resolver el requerimiento de la clasificación y priorización de platillos. Este patrón permite definir una familia de algoritmos (por ejemplo, un algoritmo que ordene por tiempo de preparación, otro que ordene por nivel de dificultad, o uno combinado) colocándolos en clases separadas y haciéndolos intercambiables según las necesidades de la hora pico del restaurante.  
* **Patrón State (Estado):** Es el pilar del tablero Kanban. Este patrón permite a la entidad "Comanda" alterar su comportamiento cuando su estado interno cambia. Visualmente y a nivel de base de datos, el objeto reacciona y restringe ciertas acciones dependiendo de si se encuentra en estado *Pendiente*, *En preparación* o *Listo*.


# 

# 

# 

# 

# 

# 

# 

# 

## **4\. Modelado UML del Sistema (Diagramas)**

Para estandarizar la comunicación del equipo de desarrollo y visualizar tanto el comportamiento estático como dinámico del sistema, se utilizó el Lenguaje de Modelado Unificado (UML). A continuación, se desglosan los diagramas estructurales y de comportamiento aplicados al proyecto del restaurante "El Rincón del Parque".

### **4.1 Diagrama de Casos de Uso**

Este diagrama representa las interacciones funcionales entre los usuarios (actores) y el sistema. Permite delimitar el alcance de lo que cada rol puede hacer dentro de la plataforma.

* **Mesero:** Se encarga de la entrada de datos. Sus casos de uso principales son tomar la orden, enviarla al núcleo del sistema y visualizar cuándo un platillo cambia a estado "Listo".  
* **Cocinero:** Su interacción es estrictamente operativa. Visualiza el tablero Kanban y su caso de uso principal es actualizar el estado de la comanda (arrastrar y soltar) entre las columnas de preparación.  
* **Administrador:** Tiene acceso privilegiado. Gestiona el CRUD (Crear, Leer, Actualizar, Borrar) del menú y consulta los tickets generados en la base de datos estructurada.

### **4.2 Diagrama de Clases (Modelado Híbrido)**

Dado que gran parte del software moderno se basa en la definición de objetos, el diagrama de clases muestra la estructura estática del sistema. Para resolver la complejidad de la **Persistencia Políglota** (manejar dos bases de datos), este diagrama se dividió lógicamente:

* **Clases Estructuradas (SQL):** En los extremos del sistema, se modelaron clases tradicionales estrictas como `Factura`, `Cliente` y `Detalle_Ticket`. Estas clases tienen llaves primarias y foráneas, asegurando la integridad financiera.  
* **Clases de Documento (NoSQL):** En el centro operativo de la cocina (Convex), se modeló la clase `Pedido_Kanban`. A diferencia de una tabla relacional, esta clase representa la estructura de un documento JSON dinámico, con atributos sueltos como `estado_actual`, `tiempo_preparacion`, y `nivel_prioridad`, lo que permite que el algoritmo interno lo modifique sobre la marcha sin romper esquemas rígidos.

### **4.3 Diagrama de Componentes**

Este diagrama descompone el sistema complejo en partes más pequeñas y manejables, mostrando cómo se conectan los bloques de código. Para este proyecto, visualiza la separación del entorno de ejecución (Bun) utilizando el framework **TanStack Start** para renderizar la Interfaz de Usuario (UI), conectado directamente a través de funciones y webhooks a los componentes del backend provistos por **Convex** (Autenticación y Base de Datos en tiempo real).

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### 

### **4.4 Diagrama de Despliegue**

Muestra el mapeo del software sobre la arquitectura de hardware físico o en la nube. En este caso, el diagrama ilustra cómo los dispositivos móviles de los meseros (Tablets/Smartphones) y las pantallas táctiles de la cocina acceden a la aplicación web a través de la nube de **Railway** (donde se aloja el frontend), mientras que el flujo de eventos y web sockets se procesan en los clústeres de servidores de **Convex Cloud**.

## **5\. Evidencias del Micrositio (Menú Digital)**

### **5.1 Propósito y Justificación del Micrositio**

El micrositio desarrollado actúa como un componente desacoplado del Sistema de Comandas (Core). Mientras que el núcleo operativo se encarga de la gestión de pedidos en tiempo real (que requiere autenticación, persistencia y WebSockets), el micrositio cumple con una **función de solo lectura**: exponer el catálogo de platillos del restaurante "El Rincón del Parque" al comensal final.

**Justificación basada en arquitectura:**

* **Desacoplamiento (Decoupling):** Al implementar este micrositio como una pieza independiente, aislamos el tráfico público (clientes consultando el menú) del tráfico administrativo/operativo (cocineros y meseros). Esto evita que el sistema principal sufra latencia o problemas de disponibilidad durante horas pico de alta afluencia de clientes en el local.  
* **Escalabilidad modular:** Como el micrositio es ligero y estático, podemos escalar sus recursos (instancias en Railway) de forma independiente al núcleo, optimizando costos y rendimiento según el patrón visto en clase sobre el desarrollo de sistemas modulares.

### **5.2 Diseño y Flujo de Usuario**

El micrositio fue diseñado con un enfoque *Mobile-First*, considerando que el 90% de los comensales accederán desde sus dispositivos personales.

1. **Entrada:** Escaneo de código QR en la mesa.  
2. **Procesamiento:** El usuario accede a la URL del micrositio sin necesidad de registro previo.  
3. **Visualización:** Despliegue de categorías (Entradas, Platos Fuertes, Postres, Bebidas) con precios e información nutricional.

### **5.3 Evidencias de Ejecución (Contenido para esta sección)**

*Nota para Angelina: Para que esta sección sea completa, es obligatorio que incluya lo siguiente:*

* **Capturas de pantalla del micrositio:**  
  * *Captura 1:* Pantalla de bienvenida (Landing) con el logo del restaurante.  
  * *Captura 2:* Vista de la lista de platillos (menú detallado).  
  * *Captura 3:* Vista del detalle de un platillo (foto, descripción, precio).  
* **Enlace al despliegue:** Incluir la URL pública donde está alojado el micrositio (ej. `rincon-del-parque-menu.railway.app`).  
* **Imagen del Código QR:** Colocar una muestra del código QR que el cliente escanearía en la mesa.

# **Capturas del sistema**

# **Conclusiones**

# **Bibliografía en formato APA**

# 

# 

# 

# 

# 

# 

# 

# 

# **Anexos**

* Minuta de la Entrevista

### **Resumen de la Entrevista**

**Analista:** Muchas gracias por recibirnos en *El Rincón del Parque*. Para comenzar, ¿podría explicarnos cómo es actualmente el proceso desde que un cliente ordena hasta que el platillo llega a su mesa?

**Gerente:** Claro. Actualmente, los meseros toman la orden a mano y la llevan a la cocina. Ahí dejan el ticket físico colgado. A veces usamos un sistema digital que tenemos en una tablet, pero es muy anticuado y los cocineros tienen que estar recargando la pantalla a cada rato para ver si entró un pedido nuevo.

**Analista:** Entiendo. ¿Cuáles son los principales problemas que han detectado con este método?

**Gerente:** ¡El caos en las horas pico\! Al usar tickets de papel, muchas veces se pierden o se manchan. Además, hay muy mala comunicación entre el personal del salón y la cocina. Como el sistema digital falla, hay retrasos en la preparación de los alimentos y yo, como gerente, no tengo visibilidad sobre el estado actual de cada pedido.

**Analista:** ¿Cómo saben los meseros que un platillo ya está listo para ser servido?

**Gerente:** Ese es otro gran problema. Los meseros tienen que estar entrando constantemente a la cocina a preguntar si su plato ya salió, lo que interrumpe a los cocineros y hace que todo sea más lento. Un restaurante requiere sincronización exacta entre los meseros que toman la orden y los cocineros que la preparan, y ahora mismo no la tenemos.

**Analista:** Para solucionar esto, estamos proponiendo una herramienta visual y rápida. ¿Qué le parecería una pantalla en la cocina donde los pedidos aparezcan en tiempo real, divididos por columnas según su estado?

**Gerente:** Me parece excelente. Necesitaríamos que fuera algo muy fácil de usar para los cocineros, sin que tengan que presionar muchos botones.

**Analista:** Podríamos diseñar una interfaz basada en un tablero Kanban. Los cocineros podrían simplemente arrastrar y soltar la tarjeta del pedido hacia la siguiente columna cuando empiecen a cocinar. ¿Cuáles serían los estados ideales para sus platillos?

**Gerente:** Solo necesitamos tres estados bien definidos para no complicarnos: Pendiente, En preparación y Listo. Cuando pase a "Listo", los meseros deberían poder verlo en sus propias pantallas para recogerlo inmediatamente.

**Analista:** Perfecto, la sincronización instantánea está garantizada. Por último, ¿quién se encargaría de actualizar el menú y los precios en el sistema?

**Gerente:** Yo me encargaría de eso como administrador. Necesito un lugar en el sistema para registrar nuevos platos, ponerles una descripción, el precio y el tiempo estimado de preparación.

**Analista:** Excelente. Recapitularemos toda esta información para generar nuestro análisis formal y definir los requerimientos de la aplicación.

### **Roles del Equipo**

| Rol | Responsabilidad |
| :---- | :---- |
| **Analista de requerimientos** | Encargado de definir las historias de usuario y reglas de negocio del sistema de comandas. |
| **Diseñador** | Responsable de maquetar la interfaz del tablero Kanban y la sección de administración de platos. |
| **Desarrollador** | Encargado de implementar el frontend con TanStack Start, el backend con Convex y el despliegue en Railway. |
| **Tester** | Responsable de verificar la sincronización en tiempo real y el correcto funcionamiento del Drag & Drop en distintos navegadores. |

* 