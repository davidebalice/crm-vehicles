-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Apr 12, 2025 alle 15:19
-- Versione del server: 10.4.24-MariaDB
-- Versione PHP: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `car-crm`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `type` text NOT NULL,
  `date` datetime NOT NULL,
  `status` text NOT NULL,
  `vehicle_id` int(11) DEFAULT NULL,
  `customer_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `appointments`
--

INSERT INTO `appointments` (`id`, `type`, `date`, `status`, `vehicle_id`, `customer_id`, `user_id`, `notes`) VALUES
(1, 'test_drive', '2025-04-04 11:44:01', 'scheduled', 1, 1, 1, 'Test drive for the new Audi A4'),
(2, 'service', '2025-04-05 11:44:01', 'scheduled', 2, 2, 1, 'Regular maintenance for Volkswagen Golf'),
(3, 'consultation', '2025-04-06 11:44:01', 'scheduled', NULL, 3, 1, 'Financial consultation for vehicle purchase');

-- --------------------------------------------------------

--
-- Struttura della tabella `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `email` text NOT NULL,
  `first_name` text NOT NULL,
  `last_name` text NOT NULL,
  `phone` text NOT NULL,
  `address` text DEFAULT NULL,
  `city` text DEFAULT NULL,
  `zip_code` text DEFAULT NULL,
  `document_id` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `customers`
--

INSERT INTO `customers` (`id`, `email`, `first_name`, `last_name`, `phone`, `address`, `city`, `zip_code`, `document_id`, `notes`, `created_at`) VALUES
(1, 'paolo.bianchi@example.com', 'Paolo', 'Bianchi', '+39 123 456 7890', 'Via Roma 123', 'Milano', '20100', 'AB12345CD', 'Interested in premium vehicles', '2025-04-04 09:44:01'),
(2, 'marco.verdi@example.com', 'Marco', 'Verdi', '+39 098 765 4321', 'Via Napoli 45', 'Roma', '00100', 'EF67890GH', 'Returning customer, has purchased 2 vehicles', '2025-04-04 09:44:01'),
(3, 'laura.neri@example.com', 'Laura', 'Neri', '+39 456 789 0123', 'Via Torino 78', 'Torino', '10100', 'IJ12345KL', 'Looking for financing options', '2025-04-04 09:44:01');

-- --------------------------------------------------------

--
-- Struttura della tabella `finances`
--

CREATE TABLE `finances` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) DEFAULT NULL,
  `customer_id` int(11) NOT NULL,
  `type` text NOT NULL,
  `status` text NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `interest_rate` decimal(5,2) DEFAULT NULL,
  `term` int(11) DEFAULT NULL,
  `monthly_payment` decimal(10,2) DEFAULT NULL,
  `down_payment` decimal(10,2) DEFAULT NULL,
  `start_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `finances`
--

INSERT INTO `finances` (`id`, `sale_id`, `customer_id`, `type`, `status`, `amount`, `interest_rate`, `term`, `monthly_payment`, `down_payment`, `start_date`, `end_date`, `notes`) VALUES
(2, 1, 1, 'loan', 'approved', '30000.00', '4.50', 48, '685.50', '8500.00', '2025-03-28 10:44:01', '2029-03-14 10:44:01', 'Approved finance through dealership partner bank'),
(3, 2, 2, 'leasing', 'completed', '28900.00', '3.90', 36, '709.72', '5000.00', '2025-03-21 10:44:01', '2028-03-19 10:44:01', 'Leasing completed with residual value option'),
(4, NULL, 3, 'loan', 'pending', '25000.00', '5.20', 60, '419.85', '3000.00', '2025-04-04 16:04:50', '2025-04-04 16:04:50', 'Customer applied for financing, pending approval');

-- --------------------------------------------------------

--
-- Struttura della tabella `parts`
--

CREATE TABLE `parts` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `part_number` text NOT NULL,
  `category` text NOT NULL,
  `description` text DEFAULT NULL,
  `supplier` text DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT NULL,
  `cost` decimal(10,0) NOT NULL,
  `price` decimal(10,0) NOT NULL,
  `min_quantity` int(11) NOT NULL DEFAULT 1,
  `location` text DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `barcode` text DEFAULT NULL,
  `status` text NOT NULL DEFAULT 'active',
  `last_order_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `compatibility` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`compatibility`)),
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `parts`
--

INSERT INTO `parts` (`id`, `name`, `part_number`, `category`, `description`, `supplier`, `stock_quantity`, `cost`, `price`, `min_quantity`, `location`, `supplier_id`, `barcode`, `status`, `last_order_date`, `compatibility`, `images`, `created_at`, `updated_at`) VALUES
(1, 'Brake Pad', 'BP123', 'Brakes', 'Front brake pads for Audi A4', 'Supplier A', 100, '31', '45', 10, 'A1', 1, '1234567890123', 'active', '2025-03-01 10:44:01', '[]', '[]', '2025-03-04 10:44:01', '2025-03-05 10:44:01');

-- --------------------------------------------------------

--
-- Struttura della tabella `part_orders`
--

CREATE TABLE `part_orders` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `order_number` text NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `expected_delivery_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `delivery_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` text NOT NULL DEFAULT 'pending',
  `total_cost` double NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `part_orders`
--

INSERT INTO `part_orders` (`id`, `supplier_id`, `order_number`, `order_date`, `expected_delivery_date`, `delivery_date`, `status`, `total_cost`, `notes`, `created_by`, `created_at`) VALUES
(1, 1, 'PO12345', '2025-04-04 09:44:01', '2025-04-10 09:44:01', '2025-04-09 09:44:01', 'delivered', 500, 'Order complete', 1, '2025-04-04 09:44:01');

-- --------------------------------------------------------

--
-- Struttura della tabella `part_order_items`
--

CREATE TABLE `part_order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `part_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_cost` double NOT NULL,
  `quantity_received` int(11) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `part_order_items`
--

INSERT INTO `part_order_items` (`id`, `order_id`, `part_id`, `quantity`, `unit_cost`, `quantity_received`, `notes`) VALUES
(1, 1, 1, 10, 25.5, 10, 'First batch of parts received');

-- --------------------------------------------------------

--
-- Struttura della tabella `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` text NOT NULL,
  `sale_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sale_price` decimal(10,0) NOT NULL,
  `payment_method` text NOT NULL,
  `notes` text DEFAULT NULL,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `sales`
--

INSERT INTO `sales` (`id`, `vehicle_id`, `customer_id`, `user_id`, `status`, `sale_date`, `sale_price`, `payment_method`, `notes`, `documents`) VALUES
(1, 1, 1, 1, 'completed', '2025-03-28 10:44:01', '38500', 'finance', 'Customer financed through bank', NULL),
(2, 2, 2, 1, 'completed', '2025-03-21 10:44:01', '28900', 'leasing', 'Customer opted for leasing', NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `scheduled_transactions`
--

CREATE TABLE `scheduled_transactions` (
  `id` int(11) NOT NULL,
  `description` text NOT NULL,
  `amount` double NOT NULL,
  `type` text NOT NULL,
  `category` text NOT NULL,
  `due_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `payment_method` text NOT NULL,
  `frequency` text DEFAULT NULL,
  `is_recurring` tinyint(1) NOT NULL DEFAULT 0,
  `reference` text DEFAULT NULL,
  `related_entity_type` text DEFAULT NULL,
  `related_entity_id` int(11) DEFAULT NULL,
  `status` text NOT NULL DEFAULT 'pending',
  `notification_days` int(11) DEFAULT 7,
  `last_notification_sent` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `scheduled_transactions`
--

INSERT INTO `scheduled_transactions` (`id`, `description`, `amount`, `type`, `category`, `due_date`, `payment_method`, `frequency`, `is_recurring`, `reference`, `related_entity_type`, `related_entity_id`, `status`, `notification_days`, `last_notification_sent`, `notes`, `created_at`, `created_by`) VALUES
(1, 'Payment for service', 500, 'invoice', 'service', '2025-04-05 09:44:01', 'credit_card', 'monthly', 1, 'REF12345', 'service', 1, 'pending', 5, '2025-04-03 10:00:00', 'Payment due for recent service request', '2025-04-01 08:30:00', 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `service_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `completion_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` text NOT NULL,
  `cost` decimal(10,0) NOT NULL,
  `parts_cost` decimal(10,0) DEFAULT NULL,
  `labor_cost` decimal(10,0) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `services`
--

INSERT INTO `services` (`id`, `vehicle_id`, `customer_id`, `description`, `service_date`, `completion_date`, `status`, `cost`, `parts_cost`, `labor_cost`, `notes`) VALUES
(1, 1, 1, 'Routine oil change', '2025-04-04 08:30:00', '2025-04-04 10:00:00', 'completed', '120', '50', '70', 'No issues during service');

-- --------------------------------------------------------

--
-- Struttura della tabella `session`
--

CREATE TABLE `session` (
  `sid` varchar(255) NOT NULL,
  `sess` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`sess`)),
  `expire` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `session`
--

INSERT INTO `session` (`sid`, `sess`, `expire`) VALUES
('2xW20Qbdb8YdQLP1JHd2gSUIY5gWSsAB', '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-04-05T12:24:47.449Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":1}}', '2025-04-05 10:31:09.000000');

-- --------------------------------------------------------

--
-- Struttura della tabella `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `sid` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `expires` datetime NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struttura della tabella `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `contact_person` text NOT NULL,
  `email` text NOT NULL,
  `phone` text NOT NULL,
  `address` text NOT NULL,
  `city` text NOT NULL,
  `zip_code` text NOT NULL,
  `country` text NOT NULL DEFAULT 'Italia',
  `vat_number` text NOT NULL,
  `website` text DEFAULT NULL,
  `payment_terms` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `email`, `phone`, `address`, `city`, `zip_code`, `country`, `vat_number`, `website`, `payment_terms`, `notes`, `is_active`, `created_at`) VALUES
(1, 'Supplier A', 'John Doe', 'contact@suppliera.com', '+39 012 345 6789', 'Via Milano 10', 'Milano', '20100', 'Italy', 'IT123456789', 'www.suppliera.com', '30 days', 'Reliable supplier for auto parts', 1, '2025-04-04 09:44:01');

-- --------------------------------------------------------

--
-- Struttura della tabella `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` text NOT NULL,
  `description` text DEFAULT NULL,
  `priority` text NOT NULL,
  `status` text NOT NULL,
  `assigned_to` int(11) NOT NULL,
  `due_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `priority`, `status`, `assigned_to`, `due_date`, `created_at`) VALUES
(1, 'Update price list', 'Update the new vehicle price list with the latest from BMW', 'medium', 'pending', 1, '2025-04-09 09:44:01', '2025-04-04 09:44:01');

-- --------------------------------------------------------

--
-- Struttura della tabella `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `description` text NOT NULL,
  `amount` double NOT NULL,
  `type` text NOT NULL,
  `category` text NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `payment_method` text NOT NULL,
  `reference` text DEFAULT NULL,
  `related_entity_type` text DEFAULT NULL,
  `related_entity_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `receipts` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`receipts`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `transactions`
--

INSERT INTO `transactions` (`id`, `description`, `amount`, `type`, `category`, `date`, `payment_method`, `reference`, `related_entity_type`, `related_entity_id`, `notes`, `receipts`, `created_at`, `created_by`) VALUES
(1, 'Service payment', 500, 'payment', 'service', '2025-04-04 09:44:01', 'credit_card', 'TXN12345', 'service', 1, 'Payment for vehicle service', NULL, '2025-04-04 09:44:01', 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` text NOT NULL,
  `password` text NOT NULL,
  `full_name` text NOT NULL,
  `email` text NOT NULL,
  `role` text NOT NULL,
  `avatar_url` text DEFAULT NULL,
  `last_access` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `role`, `avatar_url`, `last_access`) VALUES
(1, 'admin', 'admin123', 'Mario Rossi', 'admin@automotoplus.com', 'admin', 'https://randomuser.me/api/portraits/men/32.jpg', NULL),
(3, 'mario', '54bc5a8ab05fafde2a649c0ccc4a7aeceb95e78ecdf501c5f5d203a5e481e0f3a8d52181143a3dfe5d4865b17cc44d5fce02a0f399dd5b6d1ec9dd9514768b62.98fb2c8f1b5f5753', 'Mario Rossi', 'mario@rossi.it', 'admin', NULL, NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL,
  `model_id` int(11) NOT NULL,
  `vin` text NOT NULL,
  `license_plate` text DEFAULT NULL,
  `color` text NOT NULL,
  `condition` text NOT NULL,
  `status` text NOT NULL,
  `year` int(11) NOT NULL,
  `mileage` int(11) DEFAULT NULL,
  `price` decimal(10,0) NOT NULL,
  `cost_price` decimal(10,0) NOT NULL,
  `description` text DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `fuel_type` text NOT NULL DEFAULT 'benzina'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `vehicles`
--

INSERT INTO `vehicles` (`id`, `model_id`, `vin`, `license_plate`, `color`, `condition`, `status`, `year`, `mileage`, `price`, `cost_price`, `description`, `features`, `images`, `created_at`, `fuel_type`) VALUES
(1, 1, 'WAUZZZ8K9NA123456', NULL, 'Blue', 'new', 'available', 2023, 0, '38500', '35000', 'Brand new Audi A4 Avant with premium features', '[\"Leather seats\", \"Navigation\", \"Climate control\", \"LED headlights\"]', '[\"https://images.unsplash.com/photo-1494976388531-d1058494cdd8\"]', '2025-04-04 09:44:01', 'diesel'),
(2, 2, 'WVWZZZ1KZAW987654', 'AB123CD', 'Red', 'used', 'available', 2021, 25420, '28900', '25000', 'Well-maintained Volkswagen Golf GTI in excellent condition', '[\"Sport seats\", \"Panoramic roof\", \"Digital dashboard\", \"Adaptive cruise control\"]', '[\"http://localhost:5000/uploads/vehicles/2/1744361949714-mainImage.png\",\"http://localhost:5000/uploads/vehicles/2/1744361949716-otherImages.jpg\",\"http://localhost:5000/uploads/vehicles/2/1744361949717-otherImages.jpeg\"]', '2025-04-04 09:44:01', 'benzina'),
(3, 3, 'ZDMH123AB456C789D', 'MC789EF', 'Red', 'used', 'available', 2022, 1250, '22450', '20000', 'Ducati Panigale V4 with low mileage, perfect condition', '[\"ohlins suspension\", \"Brembo brakes\", \"Quick shifter\", \"Traction control\"]', '[\"https://images.unsplash.com/photo-1608921619105-dc9921761093\"]', '2025-04-04 09:44:01', 'benzina'),
(4, 4, '1HD1KTC14EB012345', NULL, 'Black', 'new', 'available', 2023, 0, '29900', '27000', 'New Harley Davidson Street Glide with touring package', '[\"Infotainment system\", \"ABS\", \"Cruise control\", \"Heated grips\"]', '[\"https://images.unsplash.com/photo-1631192928737-d0e4d1805e79\"]', '2025-04-04 09:44:01', 'benzina');

-- --------------------------------------------------------

--
-- Struttura della tabella `vehicle_makes`
--

CREATE TABLE `vehicle_makes` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `type` text NOT NULL,
  `logo_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `vehicle_makes`
--

INSERT INTO `vehicle_makes` (`id`, `name`, `type`, `logo_url`) VALUES
(1, 'Fiat', 'car', 'https://www.carlogos.org/car-logos/fiat-logo-2020.png'),
(2, 'Ducati', 'motorcycle', 'https://www.carlogos.org/motorcycle-logos/ducati-logo-260x400.png'),
(3, 'BMW', 'car', 'https://www.carlogos.org/car-logos/bmw-logo-1997.png'),
(4, 'Honda', 'motorcycle', 'https://www.carlogos.org/car-logos/honda-logo-1.png'),
(5, 'Audi', 'car', 'https://www.carlogos.org/car-logos/audi-logo.png'),
(6, 'Volkswagen', 'car', 'https://www.carlogos.org/car-logos/volkswagen-logo.png'),
(7, 'Ducati', 'motorcycle', 'https://www.carlogos.org/motorcycle-logos/ducati-logo.png'),
(8, 'Harley Davidson', 'motorcycle', 'https://www.carlogos.org/motorcycle-logos/harley-davidson-logo.png'),
(9, 'Audi', 'car', 'https://www.carlogos.org/car-logos/audi-logo.png'),
(10, 'Volkswagen', 'car', 'https://www.carlogos.org/car-logos/volkswagen-logo.png'),
(11, 'Ducati', 'motorcycle', 'https://www.carlogos.org/motorcycle-logos/ducati-logo.png'),
(12, 'Harley Davidson', 'motorcycle', 'https://www.carlogos.org/motorcycle-logos/harley-davidson-logo.png'),
(13, 'Audi', 'car', 'https://www.carlogos.org/car-logos/audi-logo.png'),
(14, 'Volkswagen', 'car', 'https://www.carlogos.org/car-logos/volkswagen-logo.png'),
(15, 'Ducati', 'motorcycle', 'https://www.carlogos.org/motorcycle-logos/ducati-logo.png'),
(16, 'Harley Davidson', 'motorcycle', 'https://www.carlogos.org/motorcycle-logos/harley-davidson-logo.png'),
(17, 'Audi', 'car', 'https://www.carlogos.org/car-logos/audi-logo.png'),
(18, 'Volkswagen', 'car', 'https://www.carlogos.org/car-logos/volkswagen-logo.png'),
(19, 'Ducati', 'motorcycle', 'https://www.carlogos.org/motorcycle-logos/ducati-logo.png'),
(20, 'Harley Davidson', 'motorcycle', 'https://www.carlogos.org/motorcycle-logos/harley-davidson-logo.png'),
(21, 'Audi', 'car', 'https://www.carlogos.org/car-logos/audi-logo.png'),
(22, 'Volkswagen', 'car', 'https://www.carlogos.org/car-logos/volkswagen-logo.png'),
(23, 'Ducati', 'motorcycle', 'https://www.carlogos.org/motorcycle-logos/ducati-logo.png'),
(24, 'Harley Davidson', 'motorcycle', 'https://www.carlogos.org/motorcycle-logos/harley-davidson-logo.png'),
(25, 'Audi', 'car', 'https://www.carlogos.org/car-logos/audi-logo.png'),
(26, 'Volkswagen', 'car', 'https://www.carlogos.org/car-logos/volkswagen-logo.png'),
(27, 'Ducati', 'motorcycle', 'https://www.carlogos.org/motorcycle-logos/ducati-logo.png'),
(28, 'Harley Davidson', 'motorcycle', 'https://www.carlogos.org/motorcycle-logos/harley-davidson-logo.png'),
(29, 'Audi', 'car', 'https://www.carlogos.org/car-logos/audi-logo.png'),
(30, 'Volkswagen', 'car', 'https://www.carlogos.org/car-logos/volkswagen-logo.png');

-- --------------------------------------------------------

--
-- Struttura della tabella `vehicle_models`
--

CREATE TABLE `vehicle_models` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `make_id` int(11) NOT NULL,
  `type` text NOT NULL,
  `year` int(11) NOT NULL,
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `vehicle_models`
--

INSERT INTO `vehicle_models` (`id`, `name`, `make_id`, `type`, `year`, `specifications`) VALUES
(1, 'A4 Avant', 5, 'car', 2023, '{\"fuel\": \"Gasoline\", \"power\": \"204 HP\", \"engine\": \"2.0L TFSI\", \"transmission\": \"Automatic\"}'),
(2, 'Golf GTI', 6, 'car', 2021, '{\"fuel\": \"Gasoline\", \"power\": \"245 HP\", \"engine\": \"2.0L TSI\", \"transmission\": \"Manual\"}'),
(3, 'Panigale V4', 7, 'motorcycle', 2022, '{\"fuel\": \"Gasoline\", \"power\": \"214 HP\", \"engine\": \"1103cc V4\", \"transmission\": \"6-speed\"}'),
(4, 'Street Glide', 8, 'motorcycle', 2023, '{\"fuel\": \"Gasoline\", \"power\": \"90 HP\", \"engine\": \"1868cc V-Twin\", \"transmission\": \"6-speed\"}'),
(5, 'A4 Avant', 9, 'car', 2023, '{\"fuel\": \"Gasoline\", \"power\": \"204 HP\", \"engine\": \"2.0L TFSI\", \"transmission\": \"Automatic\"}'),
(6, 'Golf GTI', 10, 'car', 2021, '{\"fuel\": \"Gasoline\", \"power\": \"245 HP\", \"engine\": \"2.0L TSI\", \"transmission\": \"Manual\"}'),
(7, 'Panigale V4', 11, 'motorcycle', 2022, '{\"fuel\": \"Gasoline\", \"power\": \"214 HP\", \"engine\": \"1103cc V4\", \"transmission\": \"6-speed\"}'),
(8, 'Street Glide', 12, 'motorcycle', 2023, '{\"fuel\": \"Gasoline\", \"power\": \"90 HP\", \"engine\": \"1868cc V-Twin\", \"transmission\": \"6-speed\"}'),
(9, 'A4 Avant', 13, 'car', 2023, '{\"fuel\": \"Gasoline\", \"power\": \"204 HP\", \"engine\": \"2.0L TFSI\", \"transmission\": \"Automatic\"}'),
(10, 'Golf GTI', 14, 'car', 2021, '{\"fuel\": \"Gasoline\", \"power\": \"245 HP\", \"engine\": \"2.0L TSI\", \"transmission\": \"Manual\"}'),
(11, 'Panigale V4', 15, 'motorcycle', 2022, '{\"fuel\": \"Gasoline\", \"power\": \"214 HP\", \"engine\": \"1103cc V4\", \"transmission\": \"6-speed\"}'),
(12, 'Street Glide', 16, 'motorcycle', 2023, '{\"fuel\": \"Gasoline\", \"power\": \"90 HP\", \"engine\": \"1868cc V-Twin\", \"transmission\": \"6-speed\"}'),
(13, 'A4 Avant', 17, 'car', 2023, '{\"fuel\": \"Gasoline\", \"power\": \"204 HP\", \"engine\": \"2.0L TFSI\", \"transmission\": \"Automatic\"}'),
(14, 'Golf GTI', 18, 'car', 2021, '{\"fuel\": \"Gasoline\", \"power\": \"245 HP\", \"engine\": \"2.0L TSI\", \"transmission\": \"Manual\"}'),
(15, 'Panigale V4', 19, 'motorcycle', 2022, '{\"fuel\": \"Gasoline\", \"power\": \"214 HP\", \"engine\": \"1103cc V4\", \"transmission\": \"6-speed\"}'),
(16, 'Street Glide', 20, 'motorcycle', 2023, '{\"fuel\": \"Gasoline\", \"power\": \"90 HP\", \"engine\": \"1868cc V-Twin\", \"transmission\": \"6-speed\"}'),
(17, 'A4 Avant', 21, 'car', 2023, '{\"fuel\": \"Gasoline\", \"power\": \"204 HP\", \"engine\": \"2.0L TFSI\", \"transmission\": \"Automatic\"}'),
(18, 'Golf GTI', 22, 'car', 2021, '{\"fuel\": \"Gasoline\", \"power\": \"245 HP\", \"engine\": \"2.0L TSI\", \"transmission\": \"Manual\"}'),
(19, 'Panigale V4', 23, 'motorcycle', 2022, '{\"fuel\": \"Gasoline\", \"power\": \"214 HP\", \"engine\": \"1103cc V4\", \"transmission\": \"6-speed\"}'),
(20, 'Street Glide', 24, 'motorcycle', 2023, '{\"fuel\": \"Gasoline\", \"power\": \"90 HP\", \"engine\": \"1868cc V-Twin\", \"transmission\": \"6-speed\"}'),
(21, 'A4 Avant', 25, 'car', 2023, '{\"fuel\": \"Gasoline\", \"power\": \"204 HP\", \"engine\": \"2.0L TFSI\", \"transmission\": \"Automatic\"}'),
(22, 'Golf GTI', 26, 'car', 2021, '{\"fuel\": \"Gasoline\", \"power\": \"245 HP\", \"engine\": \"2.0L TSI\", \"transmission\": \"Manual\"}');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointments_customer_id_fkey` (`customer_id`),
  ADD KEY `appointments_user_id_fkey` (`user_id`),
  ADD KEY `appointments_vehicle_id_fkey` (`vehicle_id`);

--
-- Indici per le tabelle `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `finances`
--
ALTER TABLE `finances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `finances_customer_id_fkey` (`customer_id`),
  ADD KEY `finances_sale_id_fkey` (`sale_id`);

--
-- Indici per le tabelle `parts`
--
ALTER TABLE `parts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parts_supplier_id_fkey` (`supplier_id`);

--
-- Indici per le tabelle `part_orders`
--
ALTER TABLE `part_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `part_orders_created_by_fkey` (`created_by`),
  ADD KEY `part_orders_supplier_id_fkey` (`supplier_id`);

--
-- Indici per le tabelle `part_order_items`
--
ALTER TABLE `part_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `part_order_items_order_id_fkey` (`order_id`),
  ADD KEY `part_order_items_part_id_fkey` (`part_id`);

--
-- Indici per le tabelle `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_customer_id_fkey` (`customer_id`),
  ADD KEY `sales_user_id_fkey` (`user_id`),
  ADD KEY `sales_vehicle_id_fkey` (`vehicle_id`);

--
-- Indici per le tabelle `scheduled_transactions`
--
ALTER TABLE `scheduled_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `services_customer_id_fkey` (`customer_id`),
  ADD KEY `services_vehicle_id_fkey` (`vehicle_id`);

--
-- Indici per le tabelle `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`sid`),
  ADD KEY `IDX_session_expire` (`expire`);

--
-- Indici per le tabelle `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sid` (`sid`);

--
-- Indici per le tabelle `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tasks_assigned_to_fkey` (`assigned_to`);

--
-- Indici per le tabelle `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicles_model_id_fkey` (`model_id`);

--
-- Indici per le tabelle `vehicle_makes`
--
ALTER TABLE `vehicle_makes`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `vehicle_models`
--
ALTER TABLE `vehicle_models`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicle_models_make_id_fkey` (`make_id`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `finances`
--
ALTER TABLE `finances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `parts`
--
ALTER TABLE `parts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `part_orders`
--
ALTER TABLE `part_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `part_order_items`
--
ALTER TABLE `part_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `scheduled_transactions`
--
ALTER TABLE `scheduled_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT per la tabella `vehicle_makes`
--
ALTER TABLE `vehicle_makes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT per la tabella `vehicle_models`
--
ALTER TABLE `vehicle_models`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `appointments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `appointments_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`);

--
-- Limiti per la tabella `finances`
--
ALTER TABLE `finances`
  ADD CONSTRAINT `finances_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `finances_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`);

--
-- Limiti per la tabella `parts`
--
ALTER TABLE `parts`
  ADD CONSTRAINT `parts_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`);

--
-- Limiti per la tabella `part_orders`
--
ALTER TABLE `part_orders`
  ADD CONSTRAINT `part_orders_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `part_orders_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`);

--
-- Limiti per la tabella `part_order_items`
--
ALTER TABLE `part_order_items`
  ADD CONSTRAINT `part_order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `part_orders` (`id`),
  ADD CONSTRAINT `part_order_items_part_id_fkey` FOREIGN KEY (`part_id`) REFERENCES `parts` (`id`);

--
-- Limiti per la tabella `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `sales_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `sales_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`);

--
-- Limiti per la tabella `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `services_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`);

--
-- Limiti per la tabella `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`);

--
-- Limiti per la tabella `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`model_id`) REFERENCES `vehicle_models` (`id`),
  ADD CONSTRAINT `vehicles_model_id_fkey` FOREIGN KEY (`model_id`) REFERENCES `vehicle_models` (`id`);

--
-- Limiti per la tabella `vehicle_models`
--
ALTER TABLE `vehicle_models`
  ADD CONSTRAINT `vehicle_models_ibfk_1` FOREIGN KEY (`make_id`) REFERENCES `vehicle_makes` (`id`),
  ADD CONSTRAINT `vehicle_models_make_id_fkey` FOREIGN KEY (`make_id`) REFERENCES `vehicle_makes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
