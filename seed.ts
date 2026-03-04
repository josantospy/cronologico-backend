import { Client as PgClient } from 'pg';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const db = new PgClient({
  host: 'ep-plain-paper-ai4gqqwi-pooler.c-4.us-east-1.aws.neon.tech',
  port: 5432,
  user: 'neondb_owner',
  password: 'npg_PdT9NxDs0hmG',
  database: 'cronologico',
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  await db.connect();
  console.log('✓ Conectado a la base de datos\n');

  // ─── LIMPIEZA ───────────────────────────────────────────────────────────────
  console.log('⚠  Eliminando datos existentes...');
  await db.query('DELETE FROM shipment_packers');
  await db.query('DELETE FROM package_labels');
  await db.query('DELETE FROM shipment_records');
  await db.query('DELETE FROM sequence_config');
  await db.query('DELETE FROM client_addresses');
  await db.query('DELETE FROM client_companies');
  await db.query('DELETE FROM clients');
  await db.query('DELETE FROM carrier_companies');
  await db.query('DELETE FROM carriers');
  await db.query('DELETE FROM user_companies');
  await db.query('DELETE FROM users');
  await db.query('DELETE FROM companies');
  console.log('✓ Datos eliminados\n');

  const pwd = await bcrypt.hash('Admin123!', 10);

  // ─── EMPRESA ────────────────────────────────────────────────────────────────
  const companyId = randomUUID();
  await db.query(
    `INSERT INTO companies (id, nombre, rut, direccion, telefono, email, registration_date, estado)
     VALUES ($1,$2,$3,$4,$5,$6,NOW(),true)`,
    [
      companyId,
      'Cronológicos Express S.R.L.',
      '1-31-56789-2',
      'Av. John F. Kennedy No. 45, Ensanche La Fe, Santo Domingo',
      '809-562-4400',
      'operaciones@cronologicos.com.do',
    ],
  );
  console.log('✓ Empresa creada');

  // ─── USUARIOS ───────────────────────────────────────────────────────────────
  const adminId      = randomUUID();
  const supervisorId = randomUUID();
  const carlosId     = randomUUID();
  const mariaId      = randomUUID();
  const robertoId    = randomUUID();

  await db.query(
    `INSERT INTO users (id, nombre, email, "contraseña", rol, registration_date, estado) VALUES
       ($1,'José Martínez',    'jose@cronologicos.com.do',    $6,'admin',     NOW(),true),
       ($2,'Ana Reyes',        'ana@cronologicos.com.do',     $6,'supervisor',NOW(),true),
       ($3,'Carlos Marte',     'carlos@cronologicos.com.do',  $6,'empacador', NOW(),true),
       ($4,'María Castillo',   'maria@cronologicos.com.do',   $6,'empacador', NOW(),true),
       ($5,'Roberto Peña',     'roberto@cronologicos.com.do', $6,'empacador', NOW(),true)`,
    [adminId, supervisorId, carlosId, mariaId, robertoId, pwd],
  );
  for (const uid of [adminId, supervisorId, carlosId, mariaId, robertoId]) {
    await db.query(
      `INSERT INTO user_companies (user_id, company_id) VALUES ($1,$2)`,
      [uid, companyId],
    );
  }
  console.log('✓ Usuarios creados (5)');

  // ─── TRANSPORTISTAS ─────────────────────────────────────────────────────────
  const carrier1Id = randomUUID(); // Quisqueya Cargo
  const carrier2Id = randomUUID(); // Caribe Express
  const carrier3Id = randomUUID(); // Mensajería Rápida

  await db.query(
    `INSERT INTO carriers (id, nombre, email, telefono, vehicle_type, patente, estado) VALUES
       ($1,'Quisqueya Cargo S.R.L.',     'despacho@quisqueyacargo.com.do', '809-688-1234','Camión',  'A234567', true),
       ($2,'Caribe Express Logística',   'ops@caribeexpress.com.do',       '829-774-5678','Furgón',  'B891011', true),
       ($3,'Mensajería Rápida RD',       'rutas@mensajeriarapida.com.do',  '849-910-9012','Motocicleta','C121314',true)`,
    [carrier1Id, carrier2Id, carrier3Id],
  );
  for (const cid of [carrier1Id, carrier2Id, carrier3Id]) {
    await db.query(
      `INSERT INTO carrier_companies (carrier_id, company_id) VALUES ($1,$2)`,
      [cid, companyId],
    );
  }
  console.log('✓ Transportistas creados (3)');

  // ─── CLIENTES ───────────────────────────────────────────────────────────────
  const clientDist      = randomUUID(); // Distribuidora del Caribe
  const clientFarmacia  = randomUUID(); // Farmacia Carol
  const clientSuper     = randomUUID(); // Supermercados Bravo
  const clientRepuestos = randomUUID(); // Repuestos El Volante
  const clientClinica   = randomUUID(); // Clínica Abreu

  await db.query(
    `INSERT INTO clients (id, full_name, email, telefono, document_type, document_number) VALUES
       ($1,'Distribuidora del Caribe S.R.L.',  'pedidos@distcaribe.com.do',   '809-221-3344','RNC','1-30-12345-6'),
       ($2,'Farmacia Carol',                   'farmacia@carolrd.com.do',     '809-565-7788','RNC','1-02-67890-1'),
       ($3,'Supermercados Nacional S.A.',       'compras@supernacional.com.do','809-688-9900','RNC','1-31-11223-4'),
       ($4,'Repuestos El Volante S.R.L.',       'ventas@elvolante.com.do',     '829-447-5566','RNC','1-22-44556-7'),
       ($5,'Clínica Abreu C. por A.',           'logistica@clinicaabreu.com.do','809-688-4411','RNC','1-01-98765-3')`,
    [clientDist, clientFarmacia, clientSuper, clientRepuestos, clientClinica],
  );
  for (const cid of [clientDist, clientFarmacia, clientSuper, clientRepuestos, clientClinica]) {
    await db.query(
      `INSERT INTO client_companies (client_id, company_id) VALUES ($1,$2)`,
      [cid, companyId],
    );
  }

  // Direcciones con ciudades dominicanas
  const addrRows = [
    // Distribuidora del Caribe — 2 sucursales
    [clientDist,      carrier1Id, 'Sede Central',         'Av. Duarte No. 120, Zona Industrial Herrera',             'Santo Domingo',        '809-221-3344', true ],
    [clientDist,      carrier2Id, 'Sucursal Santiago',    'Av. 27 de Febrero No. 89, Ensanche Pekín',                'Santiago',             '809-241-6677', false],
    // Farmacia Carol — 2 locales
    [clientFarmacia,  carrier2Id, 'Local Piantini',       'Av. Abraham Lincoln No. 902, Piantini',                   'Santo Domingo',        '809-565-7788', true ],
    [clientFarmacia,  carrier3Id, 'Local La Romana',      'Calle Padre Abreu No. 34',                                'La Romana',            '809-556-2233', false],
    // Supermercados Nacional — bodega central
    [clientSuper,     carrier1Id, 'Bodega Central',       'Carretera Sánchez Km 14, Parque Industrial Las Américas', 'Santo Domingo Este',   '809-688-9900', true ],
    [clientSuper,     carrier2Id, 'Sucursal San Pedro',   'Av. Circunvalación No. 45',                               'San Pedro de Macorís', '809-529-1234', false],
    // Repuestos El Volante — taller
    [clientRepuestos, carrier3Id, 'Taller Principal',     'Calle El Conde No. 205, Ciudad Colonial',                 'Santo Domingo',        '829-447-5566', true ],
    // Clínica Abreu — abastecimiento
    [clientClinica,   carrier1Id, 'Abastecimiento',       'Calle Beller No. 42, Gazcue',                             'Santo Domingo',        '809-688-4411', true ],
  ];

  for (const [cid, crid, alias, dir, ciudad, tel, pred] of addrRows) {
    await db.query(
      `INSERT INTO client_addresses (id, client_id, carrier_id, alias, direccion, ciudad, telefono, predeterminado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [randomUUID(), cid, crid, alias, dir, ciudad, tel, pred],
    );
  }
  console.log('✓ Clientes creados (5) con direcciones (8)');

  // ─── SECUENCIA ──────────────────────────────────────────────────────────────
  await db.query(
    `INSERT INTO sequence_config (id, company_id, prefijo, sequence_length, "periodoReinicio", separator, current_sequence)
     VALUES ($1,$2,'ENV',6,'anual','-',25)`,
    [randomUUID(), companyId],
  );
  console.log('✓ Configuración de secuencia creada');

  // ─── ENVÍOS ─────────────────────────────────────────────────────────────────
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(7 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);
    return d;
  };

  type Shipment = {
    ago: number;
    client: string;
    carrier: string | null;
    seq: string | null;
    pkgs: number;
    status: string;
    fragil: boolean;
    packers: [string, number][];
    facturas: string | null;
  };

  const shipments: Shipment[] = [
    // ── Diciembre 2025 (6 completados) ──
    { ago:95, client:clientDist,      carrier:carrier1Id, seq:'ENV-25-000020', pkgs:18, status:'completado', fragil:false, packers:[[carlosId,12],[mariaId,6]],    facturas:'B02-0001-00001120, B02-0001-00001121' },
    { ago:88, client:clientFarmacia,  carrier:carrier2Id, seq:'ENV-25-000021', pkgs: 6, status:'completado', fragil:true,  packers:[[robertoId,6]],               facturas:'B01-0001-00001145' },
    { ago:82, client:clientSuper,     carrier:carrier1Id, seq:'ENV-25-000022', pkgs:32, status:'completado', fragil:false, packers:[[carlosId,20],[robertoId,12]], facturas:'B02-0002-00001167, B02-0002-00001168' },
    { ago:78, client:clientRepuestos, carrier:carrier3Id, seq:'ENV-25-000023', pkgs: 4, status:'completado', fragil:true,  packers:[[mariaId,4]],                 facturas:'B01-0003-00001199' },
    { ago:73, client:clientClinica,   carrier:carrier1Id, seq:'ENV-25-000024', pkgs:22, status:'completado', fragil:true,  packers:[[carlosId,12],[mariaId,10]],  facturas:'B02-0001-00001210, B02-0001-00001211' },
    { ago:68, client:clientDist,      carrier:carrier2Id, seq:'ENV-25-000025', pkgs:10, status:'completado', fragil:false, packers:[[robertoId,10]],              facturas:'B01-0002-00001234' },

    // ── Enero 2026 (4 completados + 2 despachados) ──
    { ago:60, client:clientFarmacia,  carrier:carrier2Id, seq:'ENV-26-000001', pkgs: 8, status:'completado', fragil:false, packers:[[carlosId,8]],                facturas:'B01-0001-00000015' },
    { ago:55, client:clientSuper,     carrier:carrier1Id, seq:'ENV-26-000002', pkgs:40, status:'completado', fragil:false, packers:[[carlosId,24],[mariaId,16]],  facturas:'B02-0002-00000028, B02-0002-00000029' },
    { ago:50, client:clientRepuestos, carrier:carrier3Id, seq:'ENV-26-000003', pkgs: 5, status:'completado', fragil:true,  packers:[[robertoId,5]],               facturas:'B01-0003-00000041' },
    { ago:45, client:clientClinica,   carrier:carrier1Id, seq:'ENV-26-000004', pkgs:25, status:'completado', fragil:true,  packers:[[carlosId,14],[robertoId,11]],facturas:'B02-0001-00000056, B02-0001-00000057' },
    { ago:40, client:clientDist,      carrier:carrier2Id, seq:'ENV-26-000005', pkgs:16, status:'despachado', fragil:false, packers:[[mariaId,16]],                facturas:'B01-0002-00000072' },
    { ago:37, client:clientFarmacia,  carrier:carrier2Id, seq:'ENV-26-000006', pkgs:10, status:'despachado', fragil:true,  packers:[[carlosId,6],[robertoId,4]],  facturas:'B01-0001-00000088' },

    // ── Febrero 2026 (3 despachados + 4 en_proceso) ──
    { ago:32, client:clientSuper,     carrier:carrier1Id, seq:'ENV-26-000007', pkgs:36, status:'despachado', fragil:false, packers:[[carlosId,20],[mariaId,16]],  facturas:'B02-0002-00000095, B02-0002-00000096' },
    { ago:28, client:clientRepuestos, carrier:carrier3Id, seq:'ENV-26-000008', pkgs: 7, status:'despachado', fragil:false, packers:[[robertoId,7]],               facturas:'B01-0003-00000110' },
    { ago:25, client:clientClinica,   carrier:carrier1Id, seq:'ENV-26-000009', pkgs:28, status:'despachado', fragil:true,  packers:[[carlosId,16],[mariaId,12]],  facturas:'B02-0001-00000124' },
    { ago:21, client:clientDist,      carrier:carrier2Id, seq:null,            pkgs:14, status:'en_proceso', fragil:false, packers:[[robertoId,14]],              facturas:'B01-0002-00000138' },
    { ago:18, client:clientFarmacia,  carrier:carrier2Id, seq:null,            pkgs:12, status:'en_proceso', fragil:true,  packers:[[carlosId,7],[mariaId,5]],    facturas:'B01-0001-00000145' },
    { ago:15, client:clientSuper,     carrier:carrier1Id, seq:null,            pkgs:44, status:'en_proceso', fragil:false, packers:[[carlosId,26],[robertoId,18]],facturas:'B02-0002-00000152, B02-0002-00000153' },
    { ago:12, client:clientRepuestos, carrier:carrier3Id, seq:null,            pkgs: 6, status:'en_proceso', fragil:false, packers:[[mariaId,6]],                 facturas:'B01-0003-00000167' },

    // ── Marzo 2026 (2 en_proceso + 4 borrador) ──
    { ago: 8, client:clientClinica,   carrier:carrier1Id, seq:null, pkgs:20, status:'en_proceso', fragil:true,  packers:[[carlosId,12],[robertoId,8]],  facturas:'B02-0001-00000178' },
    { ago: 6, client:clientDist,      carrier:carrier2Id, seq:null, pkgs:13, status:'en_proceso', fragil:false, packers:[[mariaId,13]],                 facturas:'B01-0002-00000185' },
    { ago: 5, client:clientFarmacia,  carrier:null,       seq:null, pkgs: 9, status:'borrador',   fragil:false, packers:[[carlosId,9]],                 facturas:null },
    { ago: 4, client:clientSuper,     carrier:null,       seq:null, pkgs:26, status:'borrador',   fragil:true,  packers:[[carlosId,16],[robertoId,10]], facturas:null },
    { ago: 2, client:clientRepuestos, carrier:null,       seq:null, pkgs: 5, status:'borrador',   fragil:false, packers:[[mariaId,5]],                  facturas:null },
    { ago: 1, client:clientClinica,   carrier:null,       seq:null, pkgs:30, status:'borrador',   fragil:false, packers:[[carlosId,18],[mariaId,12]],   facturas:null },
  ];

  for (const s of shipments) {
    const id      = randomUUID();
    const regDate = daysAgo(s.ago);
    const conduce = s.seq ? new Date(regDate.getTime() + 1000 * 3600 * 4) : null;

    await db.query(
      `INSERT INTO shipment_records
         (id, company_id, creator_user_id, client_id, carrier_id, sequence_number,
          registration_date, conduce_date, invoice_numbers, total_packages, estado, fragil,
          created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$7,$7)`,
      [id, companyId, adminId, s.client, s.carrier, s.seq,
       regDate, conduce, s.facturas, s.pkgs, s.status, s.fragil],
    );

    for (const [packerId, qty] of s.packers) {
      await db.query(
        `INSERT INTO shipment_packers (id, shipment_id, empacador_id, cantidad_paquetes)
         VALUES ($1,$2,$3,$4)`,
        [randomUUID(), id, packerId, qty],
      );
    }
  }

  console.log(`✓ Envíos creados (${shipments.length})`);
  console.log('\n✅ Seed completado exitosamente!');
  console.log('\nCredenciales de acceso:');
  console.log('  Admin:      jose@cronologicos.com.do  / Admin123!');
  console.log('  Supervisor: ana@cronologicos.com.do   / Admin123!');
  console.log('  Empacador:  carlos@cronologicos.com.do / Admin123!');
}

seed()
  .catch(err => { console.error('\n❌ Error:', err.message); process.exit(1); })
  .finally(() => db.end());
