import { useMemo, useState } from '@lynx-js/react';
import './App.css';

type Category = 'Todos' | 'Cafés' | 'Fríos' | 'Tés' | 'Panadería';
type Tab = 'Inicio' | 'Favoritos' | 'Pedidos';
type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: Exclude<Category, 'Todos'>;
  emoji: string;
  tag?: string;
};
type CartItem = { productId: number; quantity: number };
type Order = {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  status: 'Recibido' | 'En preparación' | 'Listo';
};

const PRODUCTS: Product[] = [
  { id: 1, name: 'Latte de la casa', description: 'Espresso doble · leche cremosa', price: 58, category: 'Cafés', emoji: '☕', tag: 'Favorito' },
  { id: 2, name: 'Cappuccino', description: 'Espresso · espuma de leche', price: 54, category: 'Cafés', emoji: '☕' },
  { id: 3, name: 'Americano', description: 'Espresso · agua caliente', price: 42, category: 'Cafés', emoji: '◉' },
  { id: 4, name: 'Mocha', description: 'Chocolate · espresso · leche', price: 64, category: 'Cafés', emoji: '🍫', tag: 'De temporada' },
  { id: 5, name: 'Cold brew', description: 'Café infusionado en frío', price: 62, category: 'Fríos', emoji: '🧊' },
  { id: 6, name: 'Latte helado', description: 'Espresso · leche · hielo', price: 60, category: 'Fríos', emoji: '🥤' },
  { id: 7, name: 'Matcha latte', description: 'Té matcha · leche cremosa', price: 68, category: 'Tés', emoji: '🍵' },
  { id: 8, name: 'Té chai', description: 'Especias · té negro · leche', price: 56, category: 'Tés', emoji: '🫖' },
  { id: 9, name: 'Croissant', description: 'Hojaldre de mantequilla', price: 39, category: 'Panadería', emoji: '🥐' },
  { id: 10, name: 'Panqué de naranja', description: 'Hecho en casa · rebanada', price: 35, category: 'Panadería', emoji: '🍰' },
  { id: 11, name: 'Galleta choco-chip', description: 'Crujiente por fuera, suave dentro', price: 29, category: 'Panadería', emoji: '🍪' },
  { id: 12, name: 'Affogato', description: 'Helado de vainilla · espresso', price: 59, category: 'Fríos', emoji: '🍨', tag: 'Para consentirte' },
];

const CATEGORIES: Category[] = ['Todos', 'Cafés', 'Fríos', 'Tés', 'Panadería'];

const money = (value: number): string =>
  value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Inicio');
  const [category, setCategory] = useState<Category>('Todos');
  const [search, setSearch] = useState<string>('');
  const [favorites, setFavorites] = useState<number[]>([1, 9]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [notice, setNotice] = useState<string>('');

  const visibleProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory = category === 'Todos' || product.category === category;
      const matchesSearch = `${product.name} ${product.description}`
        .toLocaleLowerCase('es-MX')
        .includes(search.toLocaleLowerCase('es-MX'));
      const matchesTab = activeTab !== 'Favoritos' || favorites.includes(product.id);
      return matchesCategory && matchesSearch && matchesTab;
    });
  }, [category, search, activeTab, favorites]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const addToCart = (productId: number): void => {
    setCart((previous) => {
      const existing = previous.find((item) => item.productId === productId);
      if (existing) {
        return previous.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...previous, { productId, quantity: 1 }];
    });
    setNotice('Agregado a tu pedido');
  };

  const changeQuantity = (productId: number, delta: number): void => {
    setCart((previous) =>
      previous
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const toggleFavorite = (productId: number): void => {
    setFavorites((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId]
    );
  };

  const placeOrder = (): void => {
    if (cart.length === 0) return;
    const order: Order = {
      id: `ET-${Date.now().toString().slice(-6)}`,
      items: cart.map((item) => ({ ...item })),
      total: cartTotal,
      createdAt: new Date().toLocaleString('es-MX', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      }),
      status: 'Recibido',
    };
    setOrders((previous) => [order, ...previous]);
    setCart([]);
    setShowCart(false);
    setActiveTab('Pedidos');
    setNotice('¡Pedido enviado a la cafetería!');
  };

  const pageTitle = activeTab === 'Favoritos' ? 'Tus favoritos' : activeTab === 'Pedidos' ? 'Mis pedidos' : 'Algo rico te espera';

  return (
    <view className="app-shell">
      <view className="topbar">
        <view className="brand-lockup">
          <view className="brand-mark"><text>et.</text></view>
          <view className="brand-copy">
            <text className="brand-name">entre tazas</text>
            <text className="brand-subtitle">CAFÉ · PAN · PAUSA</text>
          </view>
        </view>
        <view className="top-action" bindtap={() => setShowCart(true)}>
          <text className="top-cart-icon">♧</text>
          {cartCount > 0 && <view className="cart-badge"><text>{cartCount}</text></view>}
        </view>
      </view>

      {activeTab !== 'Pedidos' && (
        <view className="welcome">
          <view className="welcome-copy">
            <text className="welcome-kicker">HECHO CON CALMA</text>
            <text className="welcome-title">Tu pausa,</text>
            <text className="welcome-title welcome-title-accent">a tu manera.</text>
            <text className="welcome-description">Café recién hecho y algo rico para acompañar el día.</text>
          </view>
          <view className="welcome-art">
            <view className="coffee-orbit"><text>☕</text></view>
            <view className="art-spark spark-a">✳</view>
            <view className="art-spark spark-b">✦</view>
          </view>
          <view className="welcome-bottom">
            <text>PREPARADO AL MOMENTO</text>
            <text className="welcome-arrow">↗</text>
          </view>
        </view>
      )}

      <view className="section-head">
        <view>
          <text className="section-kicker">{activeTab === 'Pedidos' ? 'TU ACTIVIDAD' : 'UNA BUENA ELECCIÓN'}</text>
          <text className="section-title">{pageTitle}</text>
        </view>
        {activeTab === 'Inicio' && <text className="menu-count">{visibleProducts.length} opciones</text>}
      </view>

      {activeTab !== 'Pedidos' && (
        <view className="search-wrap">
          <text className="search-symbol">⌕</text>
          <input
            className="search-input"
            default-value={search}
            placeholder="Busca tu café favorito..."
            bindinput={(event: { detail: { value: string } }) => setSearch(event.detail.value)}
          />
          {search.length > 0 && (
            <text className="clear-search" bindtap={() => setSearch('')}>×</text>
          )}
        </view>
      )}

      {activeTab !== 'Pedidos' && (
        <scroll-view scroll-orientation="horizontal" className="category-scroll">
          <view className="category-row">
            {(activeTab === 'Favoritos' ? ['Todos'] as Category[] : CATEGORIES).map((item) => (
              <view
                key={item}
                className={`category-chip ${category === item ? 'category-chip-active' : ''}`}
                bindtap={() => setCategory(item)}
              >
                <text className="category-label">{item}</text>
              </view>
            ))}
          </view>
        </scroll-view>
      )}

      {activeTab === 'Pedidos' ? (
        <view className="orders-list">
          {orders.length === 0 ? (
            <view className="empty-state">
              <view className="empty-icon"><text>♧</text></view>
              <text className="empty-title">Todavía no hay pedidos</text>
              <text className="empty-description">Cuando hagas tu primer pedido, podrás seguirlo desde aquí.</text>
              <view className="outline-button" bindtap={() => setActiveTab('Inicio')}>
                <text>Explorar el menú</text>
              </view>
            </view>
          ) : orders.map((order) => (
            <view key={order.id} className="order-card">
              <view className="order-topline">
                <text className="order-id">{order.id}</text>
                <text className="order-status">{order.status}</text>
              </view>
              <text className="order-date">{order.createdAt}</text>
              {order.items.map((item) => {
                const product = PRODUCTS.find((entry) => entry.id === item.productId);
                if (!product) return null;
                return (
                  <view key={item.productId} className="order-item">
                    <text className="order-item-name">{item.quantity} × {product.name}</text>
                    <text className="order-item-price">{money(product.price * item.quantity)}</text>
                  </view>
                );
              })}
              <view className="order-total-row">
                <text>Total pagado al ordenar</text>
                <text className="order-total">{money(order.total)}</text>
              </view>
            </view>
          ))}
        </view>
      ) : (
        <scroll-view className="catalog-scroll" scroll-orientation="vertical">
          <view className="product-grid">
            {visibleProducts.map((product) => (
              <view key={product.id} className="product-card">
                <view className={`product-art art-${product.id % 4}`}>
                  <view className="product-art-glow" />
                  <text className="product-emoji">{product.emoji}</text>
                  {product.tag && <view className="product-tag"><text>{product.tag}</text></view>}
                  <view
                    className={`favorite-button ${favorites.includes(product.id) ? 'favorite-active' : ''}`}
                    bindtap={() => toggleFavorite(product.id)}
                  >
                    <text>{favorites.includes(product.id) ? '♥' : '♡'}</text>
                  </view>
                </view>
                <view className="product-info">
                  <text className="product-category">{product.category.toUpperCase()}</text>
                  <text className="product-name">{product.name}</text>
                  <text className="product-description">{product.description}</text>
                  <view className="product-bottom">
                    <text className="product-price">{money(product.price)}</text>
                    <view className="add-button" bindtap={() => addToCart(product.id)}>
                      <text>+</text>
                    </view>
                  </view>
                </view>
              </view>
            ))}
          </view>
          {visibleProducts.length === 0 && (
            <view className="empty-state compact-empty">
              <text className="empty-title">No encontramos eso</text>
              <text className="empty-description">Prueba otra búsqueda o categoría.</text>
            </view>
          )}
          <view className="closing-note">
            <text className="closing-line" />
            <text className="closing-text">UN BUEN DÍA EMPIEZA CON UNA PAUSA</text>
            <text className="closing-line" />
          </view>
        </scroll-view>
      )}

      {cartCount > 0 && activeTab !== 'Pedidos' && (
        <view className="cart-summary">
          <view className="cart-summary-icon"><text>♧</text></view>
          <view className="cart-summary-copy">
            <text className="cart-summary-title">Tu pedido</text>
            <text className="cart-summary-detail">{cartCount} {cartCount === 1 ? 'producto' : 'productos'} · {money(cartTotal)}</text>
          </view>
          <view className="cart-summary-button" bindtap={() => setShowCart(true)}>
            <text>Ver carrito ↗</text>
          </view>
        </view>
      )}

      <view className="bottom-nav">
        <view className={`nav-item ${activeTab === 'Inicio' ? 'nav-item-active' : ''}`} bindtap={() => { setActiveTab('Inicio'); setCategory('Todos'); }}>
          <text className="nav-icon">⌂</text><text className="nav-label">Menú</text>
        </view>
        <view className={`nav-item ${activeTab === 'Favoritos' ? 'nav-item-active' : ''}`} bindtap={() => { setActiveTab('Favoritos'); setCategory('Todos'); }}>
          <text className="nav-icon">♡</text><text className="nav-label">Favoritos</text>
        </view>
        <view className={`nav-item ${activeTab === 'Pedidos' ? 'nav-item-active' : ''}`} bindtap={() => setActiveTab('Pedidos')}>
          <text className="nav-icon">▤</text><text className="nav-label">Pedidos</text>
          {orders.length > 0 && <view className="nav-dot" />}
        </view>
      </view>

      {showCart && (
        <view className="modal-backdrop">
          <view className="cart-sheet">
            <view className="sheet-handle" />
            <view className="sheet-heading">
              <view>
                <text className="section-kicker">ANTES DE DISFRUTAR</text>
                <text className="sheet-title">Tu pedido</text>
              </view>
              <view className="close-button" bindtap={() => setShowCart(false)}><text>×</text></view>
            </view>
            {cart.length === 0 ? (
              <view className="empty-cart">
                <text className="empty-cart-icon">♧</text>
                <text className="empty-title">Tu carrito está vacío</text>
                <text className="empty-description">Agrega algo rico del menú.</text>
              </view>
            ) : (
              <scroll-view className="cart-items-scroll" scroll-orientation="vertical">
                {cart.map((item) => {
                  const product = PRODUCTS.find((entry) => entry.id === item.productId);
                  if (!product) return null;
                  return (
                    <view key={item.productId} className="cart-line">
                      <view className="cart-line-emoji"><text>{product.emoji}</text></view>
                      <view className="cart-line-info">
                        <text className="cart-line-name">{product.name}</text>
                        <text className="cart-line-price">{money(product.price)} c/u</text>
                      </view>
                      <view className="quantity-control">
                        <view className="quantity-button" bindtap={() => changeQuantity(product.id, -1)}><text>−</text></view>
                        <text className="quantity-value">{item.quantity}</text>
                        <view className="quantity-button" bindtap={() => changeQuantity(product.id, 1)}><text>+</text></view>
                      </view>
                    </view>
                  );
                })}
              </scroll-view>
            )}
            <view className="cart-total-row">
              <view><text className="cart-total-label">Total</text><text className="cart-total-note">MXN · Impuestos incluidos</text></view>
              <text className="cart-total-value">{money(cartTotal)}</text>
            </view>
            <view
              className={`checkout-button ${cart.length === 0 ? 'checkout-disabled' : ''}`}
              bindtap={placeOrder}
            >
              <text>Confirmar pedido</text><text>↗</text>
            </view>
            <text className="checkout-note">Pedido de demostración · sin cobro real</text>
          </view>
        </view>
      )}

      {notice.length > 0 && (
        <view className="notice-toast" bindtap={() => setNotice('')}>
          <text className="notice-check">✓</text><text>{notice}</text><text className="notice-close">×</text>
        </view>
      )}
    </view>
  );
}
