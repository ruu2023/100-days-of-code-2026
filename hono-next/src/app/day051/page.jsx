'use client'
import { useState } from "react";

const CATEGORIES = {
  creational: {
    label: "生成パターン",
    color: "#4ade80",
    accent: "#166534",
    bg: "rgba(74,222,128,0.08)",
    icon: "⚙️",
  },
  structural: {
    label: "構造パターン",
    color: "#60a5fa",
    accent: "#1e3a5f",
    bg: "rgba(96,165,250,0.08)",
    icon: "🏗️",
  },
  behavioral: {
    label: "振る舞いパターン",
    color: "#f472b6",
    accent: "#831843",
    bg: "rgba(244,114,182,0.08)",
    icon: "🔄",
  },
};

const PATTERNS = [
  // Creational
  {
    id: "singleton",
    name: "Singleton",
    category: "creational",
    emoji: "1️⃣",
    tagline: "唯一のインスタンスを保証",
    overview:
      "Singletonパターンは、クラスのインスタンスが1つだけ存在することを保証するパターンです。データベース接続やログ管理など、システム全体で1つのオブジェクトを共有したい場合に使用します。\n\n【主なユースケース】\n• データベース接続マネージャー\n• アプリケーション設定\n• ログシステム",
    diagram: `┌─────────────────────────────┐
│          Singleton          │
├─────────────────────────────┤
│ - instance: Singleton       │ ← static
│ - count: int = 0            │
├─────────────────────────────┤
│ - Singleton()               │ ← private
│ + getInstance(): Singleton  │ ← static
│ + operation(): void         │
└─────────────────────────────┘`,
    code: `public class Singleton {
    private static Singleton instance;
    private int count = 0;

    // コンストラクタをprivateにして外部からのインスタンス化を防ぐ
    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
            System.out.println("インスタンスを生成しました");
        }
        return instance;
    }

    public void increment() {
        count++;
        System.out.println("カウント: " + count
            + " (hashCode: " + hashCode() + ")");
    }
}

public class Main {
    public static void main(String[] args) {
        Singleton s1 = Singleton.getInstance();
        s1.increment();

        Singleton s2 = Singleton.getInstance();
        s2.increment();

        System.out.println("同一インスタンス: " + (s1 == s2));
    }
}`,
    output: `インスタンスを生成しました
カウント: 1 (hashCode: 1829164700)
カウント: 2 (hashCode: 1829164700)
同一インスタンス: true`,
    tip: "マルチスレッド環境では synchronized や enum を使った実装を検討してください。",
  },
  {
    id: "factory_method",
    name: "Factory Method",
    category: "creational",
    emoji: "🏭",
    tagline: "サブクラスがインスタンス化を決定",
    overview:
      "Factory Methodパターンは、オブジェクト生成のインターフェースを定義し、どのクラスをインスタンス化するかをサブクラスに委ねるパターンです。\n\n【主なユースケース】\n• UIコンポーネントのファクトリー\n• プラグインシステム\n• データパーサーの切り替え",
    diagram: `┌───────────────┐     ┌────────────────┐
│  Creator      │     │   Product      │
│ (abstract)    │     │  (interface)   │
├───────────────┤     ├────────────────┤
│+createProduct │─ ─ ▶│+operation()    │
│  (): Product  │     └────────────────┘
└───────┬───────┘              ▲
        │                      │
┌───────▼───────┐     ┌────────┴───────┐
│ConcreteCreator│     │ConcreteProduct │
├───────────────┤     ├────────────────┤
│+createProduct │────▶│+operation()    │
└───────────────┘     └────────────────┘`,
    code: `// Product インターフェース
interface Animal {
    void speak();
}

// ConcreteProduct
class Dog implements Animal {
    public void speak() { System.out.println("ワン！"); }
}

class Cat implements Animal {
    public void speak() { System.out.println("ニャー！"); }
}

// Creator (Factory)
abstract class AnimalFactory {
    abstract Animal createAnimal();

    void introduce() {
        Animal animal = createAnimal();
        System.out.print("作られた動物: ");
        animal.speak();
    }
}

// ConcreteCreator
class DogFactory extends AnimalFactory {
    Animal createAnimal() { return new Dog(); }
}

class CatFactory extends AnimalFactory {
    Animal createAnimal() { return new Cat(); }
}

public class Main {
    public static void main(String[] args) {
        AnimalFactory f1 = new DogFactory();
        f1.introduce();

        AnimalFactory f2 = new CatFactory();
        f2.introduce();
    }
}`,
    output: `作られた動物: ワン！
作られた動物: ニャー！`,
    tip: "具体的な型に依存せず、新しい製品を追加する際にクライアントコードを変更する必要がありません。",
  },
  {
    id: "abstract_factory",
    name: "Abstract Factory",
    category: "creational",
    emoji: "🏗️",
    tagline: "関連オブジェクト群を一括生成",
    overview:
      "Abstract Factoryパターンは、関連するオブジェクトのファミリーを、具体的なクラスを指定せずに生成するインターフェースを提供します。\n\n【主なユースケース】\n• クロスプラットフォームUI\n• テーマ切り替え\n• データベース切り替え",
    diagram: `┌─────────────────┐   ┌─────────────────┐
│ AbstractFactory │   │ AbstractProduct │
│  (interface)    │   │  A / B          │
├─────────────────┤   └────────┬────────┘
│+createProductA()│            │
│+createProductB()│            ▼
└────────┬────────┘   ┌─────────────────┐
         │            │ConcreteProductA1│
┌────────▼────────┐   │ConcreteProductB1│
│ConcreteFactory1 │   └─────────────────┘
│ConcreteFactory2 │
└─────────────────┘`,
    code: `// テーマシステムの例
interface Button { void render(); }
interface TextBox { void render(); }

// Light テーマ
class LightButton implements Button {
    public void render() { System.out.println("[Button: Light]"); }
}
class LightTextBox implements TextBox {
    public void render() { System.out.println("[TextBox: Light]"); }
}

// Dark テーマ
class DarkButton implements Button {
    public void render() { System.out.println("[Button: Dark ■]"); }
}
class DarkTextBox implements TextBox {
    public void render() { System.out.println("[TextBox: Dark ■]"); }
}

// Abstract Factory
interface UIFactory {
    Button createButton();
    TextBox createTextBox();
}

class LightFactory implements UIFactory {
    public Button createButton() { return new LightButton(); }
    public TextBox createTextBox() { return new LightTextBox(); }
}

class DarkFactory implements UIFactory {
    public Button createButton() { return new DarkButton(); }
    public TextBox createTextBox() { return new DarkTextBox(); }
}

public class Main {
    static void renderUI(UIFactory factory) {
        factory.createButton().render();
        factory.createTextBox().render();
    }

    public static void main(String[] args) {
        System.out.println("-- Light Theme --");
        renderUI(new LightFactory());
        System.out.println("-- Dark Theme --");
        renderUI(new DarkFactory());
    }
}`,
    output: `-- Light Theme --
[Button: Light]
[TextBox: Light]
-- Dark Theme --
[Button: Dark ■]
[TextBox: Dark ■]`,
    tip: "製品ファミリーを簡単に切り替えられますが、新しい製品の種類を追加するには全ファクトリーの変更が必要です。",
  },
  {
    id: "builder",
    name: "Builder",
    category: "creational",
    emoji: "🔨",
    tagline: "複雑なオブジェクトを段階的に構築",
    overview:
      "Builderパターンは、複雑なオブジェクトの構築と表現を分離し、同じ構築プロセスで異なる表現を作成できるようにします。\n\n【主なユースケース】\n• SQLクエリビルダー\n• HTTPリクエスト構築\n• ゲームのキャラクター作成",
    diagram: `┌──────────┐   ┌─────────────────┐   ┌──────────┐
│ Director │──▶│     Builder     │   │ Product  │
├──────────┤   │   (abstract)    │   └──────────┘
│+construct│   ├─────────────────┤        ▲
└──────────┘   │+buildPartA()    │        │
               │+buildPartB()    │   ┌────┴─────┐
               │+getResult()     │◀──│Concrete  │
               └─────────────────┘   │Builder   │
                                     └──────────┘`,
    code: `// Product
class Computer {
    private String cpu, memory, storage;

    public void setCPU(String cpu) { this.cpu = cpu; }
    public void setMemory(String memory) { this.memory = memory; }
    public void setStorage(String storage) { this.storage = storage; }

    public void showSpec() {
        System.out.println("CPU: " + cpu);
        System.out.println("Memory: " + memory);
        System.out.println("Storage: " + storage);
    }
}

// Builder
interface ComputerBuilder {
    void buildCPU();
    void buildMemory();
    void buildStorage();
    Computer getResult();
}

// ConcreteBuilder
class GamingPCBuilder implements ComputerBuilder {
    private Computer computer = new Computer();

    public void buildCPU() { computer.setCPU("Core i9-14900K"); }
    public void buildMemory() { computer.setMemory("64GB DDR5"); }
    public void buildStorage() { computer.setStorage("2TB NVMe SSD"); }
    public Computer getResult() { return computer; }
}

// Director
class PCDirector {
    public Computer build(ComputerBuilder builder) {
        builder.buildCPU();
        builder.buildMemory();
        builder.buildStorage();
        return builder.getResult();
    }
}

public class Main {
    public static void main(String[] args) {
        PCDirector director = new PCDirector();
        Computer gamingPC = director.build(new GamingPCBuilder());
        System.out.println("=== Gaming PC ===");
        gamingPC.showSpec();
    }
}`,
    output: `=== Gaming PC ===
CPU: Core i9-14900K
Memory: 64GB DDR5
Storage: 2TB NVMe SSD`,
    tip: "メソッドチェーン（Fluent Interface）と組み合わせることで、より読みやすいコードが書けます。",
  },
  {
    id: "prototype",
    name: "Prototype",
    category: "creational",
    emoji: "📋",
    tagline: "既存インスタンスを複製して生成",
    overview:
      "Prototypeパターンは、既存のオブジェクトをコピーして新しいオブジェクトを作成するパターンです。コストの高い初期化処理を避けることができます。\n\n【主なユースケース】\n• ゲームのキャラクタークローン\n• 設定オブジェクトのコピー\n• 複雑なデータ構造の複製",
    diagram: `┌──────────────────────┐
│      Prototype       │
│     (interface)      │
├──────────────────────┤
│ + clone(): Prototype │
└──────────┬───────────┘
           │
  ┌────────▼────────┐
  │ConcretePrototype│
  ├─────────────────┤
  │ - field: T      │
  ├─────────────────┤
  │ + clone()       │
  └─────────────────┘`,
    code: `// Prototype
class Monster implements Cloneable {
    private String name;
    private int hp, attack;

    public Monster(String name, int hp, int attack) {
        this.name = name;
        this.hp = hp;
        this.attack = attack;
        System.out.println(name + " を生成しました（コスト大）");
    }

    @Override
    public Monster clone() {
        try {
            return (Monster) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }

    public void setName(String name) { this.name = name; }

    public void showStatus() {
        System.out.println(name + " | HP:" + hp + " ATK:" + attack);
    }
}

public class Main {
    public static void main(String[] args) {
        // 元のモンスター（生成コストが高い想定）
        Monster original = new Monster("ドラゴン", 1000, 150);

        // クローンで量産
        System.out.println("\\n--- クローン生成 ---");
        Monster clone1 = original.clone();
        clone1.setName("ドラゴン(clone1)");

        Monster clone2 = original.clone();
        clone2.setName("ドラゴン(clone2)");

        original.showStatus();
        clone1.showStatus();
        clone2.showStatus();
    }
}`,
    output: `ドラゴン を生成しました（コスト大）

--- クローン生成 ---
ドラゴン | HP:1000 ATK:150
ドラゴン(clone1) | HP:1000 ATK:150
ドラゴン(clone2) | HP:1000 ATK:150`,
    tip: "深いコピー（Deep Copy）が必要な場合は、参照型のフィールドも個別にコピーする必要があります。",
  },
  // Structural
  {
    id: "adapter",
    name: "Adapter",
    category: "structural",
    emoji: "🔌",
    tagline: "互換性のないインターフェースを接続",
    overview:
      "Adapterパターンは、互換性のないインターフェースを持つクラスを協調させるためのパターンです。既存のクラスを変更せずに利用できます。\n\n【主なユースケース】\n• 外部ライブラリの統合\n• レガシーシステムの接続\n• 異なるデータ形式の変換",
    diagram: `┌──────────┐   ┌──────────────┐   ┌──────────────┐
│  Client  │──▶│    Target    │   │   Adaptee    │
└──────────┘   │  (interface) │   │  (既存クラス) │
               ├──────────────┤   ├──────────────┤
               │+request()    │   │+specificReq()│
               └──────┬───────┘   └──────┬───────┘
                      │                  │
               ┌──────▼───────┐          │
               │   Adapter    │──────────┘
               ├──────────────┤  (wrap)
               │+request()    │
               └──────────────┘`,
    code: `// 既存クラス (Adaptee) - 変更不可
class LegacyPrinter {
    public void printWithBrackets(String text) {
        System.out.println("[ " + text + " ]");
    }
}

// 新しいインターフェース (Target)
interface Printer {
    void print(String text);
}

// Adapter
class PrinterAdapter implements Printer {
    private LegacyPrinter legacy;

    public PrinterAdapter(LegacyPrinter legacy) {
        this.legacy = legacy;
    }

    @Override
    public void print(String text) {
        // 新インターフェース→旧インターフェースに変換
        legacy.printWithBrackets(text);
    }
}

public class Main {
    static void clientPrint(Printer printer, String msg) {
        printer.print(msg);
    }

    public static void main(String[] args) {
        LegacyPrinter legacy = new LegacyPrinter();
        Printer adapter = new PrinterAdapter(legacy);

        clientPrint(adapter, "Hello, Adapter Pattern!");
        clientPrint(adapter, "レガシーコードを再利用");
    }
}`,
    output: `[ Hello, Adapter Pattern! ]
[ レガシーコードを再利用 ]`,
    tip: "クラスアダプター（継承）とオブジェクトアダプター（委譲）の2種類があります。Javaでは多重継承できないのでオブジェクトアダプターが一般的です。",
  },
  {
    id: "decorator",
    name: "Decorator",
    category: "structural",
    emoji: "🎨",
    tagline: "動的に機能を追加",
    overview:
      "Decoratorパターンは、オブジェクトに動的に責務を追加するパターンです。継承の代替手段として、柔軟に機能を拡張できます。\n\n【主なユースケース】\n• I/Oストリーム\n• ログ機能の追加\n• UI装飾（ボーダー、スクロール）",
    diagram: `┌─────────────┐
│  Component  │◀─────────────────┐
│ (interface) │                  │
├─────────────┤          ┌───────┴──────┐
│+operation() │          │  Decorator   │
└──────┬──────┘          ├──────────────┤
       │                 │-comp:Compnt  │
┌──────▼──────┐          │+operation()  │
│  Concrete   │          └──────┬───────┘
│  Component  │                 │
└─────────────┘    ┌────────────▼───────┐
                   │ConcreteDecoratorA/B│
                   └────────────────────┘`,
    code: `// Component
interface Coffee {
    String getDescription();
    int getCost();
}

// ConcreteComponent
class SimpleCoffee implements Coffee {
    public String getDescription() { return "コーヒー"; }
    public int getCost() { return 300; }
}

// Decorator
abstract class CoffeeDecorator implements Coffee {
    protected Coffee coffee;
    CoffeeDecorator(Coffee coffee) { this.coffee = coffee; }
}

// ConcreteDecorator
class MilkDecorator extends CoffeeDecorator {
    MilkDecorator(Coffee coffee) { super(coffee); }
    public String getDescription() {
        return coffee.getDescription() + " + ミルク";
    }
    public int getCost() { return coffee.getCost() + 100; }
}

class SyrupDecorator extends CoffeeDecorator {
    SyrupDecorator(Coffee coffee) { super(coffee); }
    public String getDescription() {
        return coffee.getDescription() + " + シロップ";
    }
    public int getCost() { return coffee.getCost() + 50; }
}

public class Main {
    static void show(Coffee c) {
        System.out.println(c.getDescription() + " → " + c.getCost() + "円");
    }

    public static void main(String[] args) {
        Coffee c1 = new SimpleCoffee();
        show(c1);

        Coffee c2 = new MilkDecorator(c1);
        show(c2);

        Coffee c3 = new SyrupDecorator(new MilkDecorator(c1));
        show(c3);
    }
}`,
    output: `コーヒー → 300円
コーヒー + ミルク → 400円
コーヒー + ミルク + シロップ → 450円`,
    tip: "JavaのI/Oストリーム（BufferedReader, InputStreamReaderなど）はDecoratorパターンの代表例です。",
  },
  {
    id: "facade",
    name: "Facade",
    category: "structural",
    emoji: "🚪",
    tagline: "複雑なシステムへの窓口",
    overview:
      "Facadeパターンは、複雑なサブシステムに対してシンプルなインターフェースを提供するパターンです。\n\n【主なユースケース】\n• ライブラリのラッパー\n• APIのシンプル化\n• スタートアップ処理の隠蔽",
    diagram: `┌──────────┐      ┌──────────────┐
│  Client  │─────▶│    Facade    │
└──────────┘      ├──────────────┤
                  │+operation()  │
                  └──────┬───────┘
          ┌───────────────┼───────────────┐
    ┌─────▼────┐   ┌──────▼─────┐  ┌─────▼────┐
    │SubSystem │   │ SubSystem  │  │SubSystem │
    │    A     │   │     B      │  │    C     │
    └──────────┘   └────────────┘  └──────────┘`,
    code: `// 複雑なサブシステム
class DVDPlayer {
    public void on() { System.out.println("DVD ON"); }
    public void play(String movie) {
        System.out.println("再生: " + movie);
    }
    public void off() { System.out.println("DVD OFF"); }
}

class Projector {
    public void on() { System.out.println("プロジェクター ON"); }
    public void setInput(String input) {
        System.out.println("入力: " + input);
    }
    public void off() { System.out.println("プロジェクター OFF"); }
}

class SoundSystem {
    public void on() { System.out.println("サウンド ON"); }
    public void setVolume(int vol) {
        System.out.println("音量: " + vol);
    }
    public void off() { System.out.println("サウンド OFF"); }
}

// Facade
class HomeTheaterFacade {
    private DVDPlayer dvd = new DVDPlayer();
    private Projector projector = new Projector();
    private SoundSystem sound = new SoundSystem();

    public void watchMovie(String movie) {
        System.out.println("=== 映画を見る準備 ===");
        projector.on();
        projector.setInput("DVD");
        sound.on();
        sound.setVolume(50);
        dvd.on();
        dvd.play(movie);
    }

    public void endMovie() {
        System.out.println("=== 終了 ===");
        dvd.off();
        sound.off();
        projector.off();
    }
}

public class Main {
    public static void main(String[] args) {
        HomeTheaterFacade theater = new HomeTheaterFacade();
        theater.watchMovie("千と千尋の神隠し");
        System.out.println("...(視聴中)...");
        theater.endMovie();
    }
}`,
    output: `=== 映画を見る準備 ===
プロジェクター ON
入力: DVD
サウンド ON
音量: 50
DVD ON
再生: 千と千尋の神隠し
...(視聴中)...
=== 終了 ===
DVD OFF
サウンド OFF
プロジェクター OFF`,
    tip: "Facadeはサブシステムへのアクセスを禁止するわけではありません。直接アクセスしたい高度なユーザーのために、サブシステムを公開しておくこともできます。",
  },
  {
    id: "composite",
    name: "Composite",
    category: "structural",
    emoji: "🌳",
    tagline: "木構造を統一的に扱う",
    overview:
      "Compositeパターンは、個別のオブジェクトとオブジェクトの集合を同一のインターフェースで扱えるようにするパターンです。\n\n【主なユースケース】\n• ファイルシステム\n• UIコンポーネントツリー\n• 組織図",
    diagram: `     ┌─────────────┐
     │  Component  │
     │ (abstract)  │
     ├─────────────┤
     │+operation() │
     └──────┬──────┘
       ┌────┴─────┐
┌──────▼──┐  ┌────▼──────┐
│  Leaf   │  │ Composite │
├─────────┤  ├───────────┤
│+op()    │  │+add(c)    │
└─────────┘  │+remove(c) │
             │+operation │
             └─────┬─────┘
                   │ contains
                   ▼
             [Component...]`,
    code: `import java.util.ArrayList;
import java.util.List;

// Component
abstract class FileSystem {
    protected String name;
    FileSystem(String name) { this.name = name; }
    abstract void show(String indent);
}

// Leaf
class File extends FileSystem {
    File(String name) { super(name); }

    @Override
    public void show(String indent) {
        System.out.println(indent + "📄 " + name);
    }
}

// Composite
class Folder extends FileSystem {
    private List<FileSystem> children = new ArrayList<>();

    Folder(String name) { super(name); }

    public void add(FileSystem f) { children.add(f); }

    @Override
    public void show(String indent) {
        System.out.println(indent + "📁 " + name);
        for (FileSystem child : children) {
            child.show(indent + "  ");
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Folder root = new Folder("project");
        Folder src = new Folder("src");
        src.add(new File("Main.java"));
        src.add(new File("App.java"));

        Folder test = new Folder("test");
        test.add(new File("AppTest.java"));

        root.add(src);
        root.add(test);
        root.add(new File("README.md"));

        root.show("");
    }
}`,
    output: `📁 project
  📁 src
    📄 Main.java
    📄 App.java
  📁 test
    📄 AppTest.java
  📄 README.md`,
    tip: "ファイルシステムの実装はCompositeパターンの典型例です。FolderとFileを同じFileSystemとして扱えることが強みです。",
  },
  {
    id: "proxy",
    name: "Proxy",
    category: "structural",
    emoji: "🛡️",
    tagline: "オブジェクトへのアクセスを制御",
    overview:
      "Proxyパターンは、別のオブジェクトへのアクセスをコントロールする代理オブジェクトを提供します。\n\n【主なユースケース】\n• 遅延初期化（Virtual Proxy）\n• アクセス制御（Protection Proxy）\n• キャッシュ（Caching Proxy）\n• ロギング",
    diagram: `┌──────────┐   ┌─────────────────┐   ┌──────────────┐
│  Client  │──▶│     Subject     │   │  RealSubject │
└──────────┘   │   (interface)   │   ├──────────────┤
               ├─────────────────┤   │+request()    │
               │+request()       │   └──────────────┘
               └────────┬────────┘         ▲
                        │              ┌───┴──────────┐
                        └─────────────▶│    Proxy     │
                                       ├──────────────┤
                                       │-real:Subject │
                                       │+request()    │
                                       └──────────────┘`,
    code: `// Subject
interface Image {
    void display();
}

// RealSubject（コストの高い処理）
class RealImage implements Image {
    private String filename;

    public RealImage(String filename) {
        this.filename = filename;
        loadFromDisk();
    }

    private void loadFromDisk() {
        System.out.println("ディスクから読み込み: " + filename);
    }

    public void display() {
        System.out.println("表示: " + filename);
    }
}

// Proxy（遅延初期化）
class ProxyImage implements Image {
    private RealImage realImage;
    private String filename;

    public ProxyImage(String filename) {
        this.filename = filename;
    }

    public void display() {
        if (realImage == null) {
            realImage = new RealImage(filename); // 必要になった時点で生成
        }
        realImage.display();
    }
}

public class Main {
    public static void main(String[] args) {
        Image img = new ProxyImage("photo.jpg");

        System.out.println("-- 1回目の表示 --");
        img.display();

        System.out.println("-- 2回目の表示（キャッシュ済み）--");
        img.display();
    }
}`,
    output: `-- 1回目の表示 --
ディスクから読み込み: photo.jpg
表示: photo.jpg
-- 2回目の表示（キャッシュ済み）--
表示: photo.jpg`,
    tip: "SpringのAOPやJava動的プロキシはこのパターンを活用しています。",
  },
  {
    id: "bridge",
    name: "Bridge",
    category: "structural",
    emoji: "🌉",
    tagline: "抽象と実装を分離して独立進化",
    overview:
      "Bridgeパターンは、抽象化と実装を分離し、それぞれが独立して変化できるようにするパターンです。\n\n【主なユースケース】\n• クロスプラットフォーム対応\n• ドライバー実装の切り替え\n• レンダリングエンジンの切り替え",
    diagram: `┌──────────────┐        ┌──────────────────┐
│  Abstraction │────────▶│  Implementor     │
│  (abstract)  │         │  (interface)     │
├──────────────┤         ├──────────────────┤
│-impl:Implmntr│         │+operationImpl()  │
│+operation()  │         └────────┬─────────┘
└──────┬───────┘           ┌──────┴──────┐
       │                   │             │
┌──────▼───────┐   ┌───────▼───┐  ┌─────▼──────┐
│  Refined     │   │ConcreteA  │  │ConcreteB   │
│  Abstraction │   └───────────┘  └────────────┘
└──────────────┘`,
    code: `// Implementor
interface Renderer {
    void renderCircle(int radius);
    void renderSquare(int side);
}

// ConcreteImplementor
class VectorRenderer implements Renderer {
    public void renderCircle(int r) {
        System.out.println("ベクター: 円 r=" + r);
    }
    public void renderSquare(int s) {
        System.out.println("ベクター: 正方形 s=" + s);
    }
}

class RasterRenderer implements Renderer {
    public void renderCircle(int r) {
        System.out.println("ラスター: 円 r=" + r + " (ピクセル描画)");
    }
    public void renderSquare(int s) {
        System.out.println("ラスター: 正方形 s=" + s + " (ピクセル描画)");
    }
}

// Abstraction
abstract class Shape {
    protected Renderer renderer;
    Shape(Renderer renderer) { this.renderer = renderer; }
    abstract void draw();
}

// Refined Abstraction
class Circle extends Shape {
    private int radius;
    Circle(Renderer r, int radius) {
        super(r);
        this.radius = radius;
    }
    public void draw() { renderer.renderCircle(radius); }
}

class Square extends Shape {
    private int side;
    Square(Renderer r, int side) {
        super(r);
        this.side = side;
    }
    public void draw() { renderer.renderSquare(side); }
}

public class Main {
    public static void main(String[] args) {
        Shape c1 = new Circle(new VectorRenderer(), 5);
        Shape c2 = new Circle(new RasterRenderer(), 5);
        Shape s1 = new Square(new VectorRenderer(), 10);

        c1.draw();
        c2.draw();
        s1.draw();
    }
}`,
    output: `ベクター: 円 r=5
ラスター: 円 r=5 (ピクセル描画)
ベクター: 正方形 s=10`,
    tip: "StrategyパターンとBridgeは似ていますが、Bridgeは構造的（クラス階層の設計時）、Strategyは振る舞い的（アルゴリズムの切り替え）という違いがあります。",
  },
  {
    id: "flyweight",
    name: "Flyweight",
    category: "structural",
    emoji: "🪶",
    tagline: "共有でメモリ使用量を削減",
    overview:
      "Flyweightパターンは、多数の細かいオブジェクトを効率よく扱うために、共有できる状態（内部状態）を持ったオブジェクトをプールして再利用するパターンです。\n\n【主なユースケース】\n• テキストエディタの文字オブジェクト\n• ゲームの大量の弾丸・木\n• フォントシステム",
    diagram: `┌───────────────────┐
│  FlyweightFactory │
├───────────────────┤
│-pool: Map<K,Fly>  │
│+getFlyweight(key) │
└─────────┬─────────┘
          │ creates/returns
    ┌─────▼──────┐
    │ Flyweight  │
    │(interface) │
    ├────────────┤
    │+operation  │
    │ (extrinsic)│
    └────────────┘`,
    code: `import java.util.HashMap;
import java.util.Map;

// Flyweight
class TreeType {
    private String name;
    private String color;

    TreeType(String name, String color) {
        this.name = name;
        this.color = color;
        System.out.println("TreeType生成: " + name);
    }

    public void draw(int x, int y) {
        System.out.println(color + "の" + name + " at (" + x + "," + y + ")");
    }
}

// FlyweightFactory
class TreeFactory {
    private static Map<String, TreeType> pool = new HashMap<>();

    public static TreeType get(String name, String color) {
        String key = name + "_" + color;
        if (!pool.containsKey(key)) {
            pool.put(key, new TreeType(name, color));
        }
        return pool.get(key);
    }

    public static int getPoolSize() { return pool.size(); }
}

public class Main {
    public static void main(String[] args) {
        // 1000本の木を描画するが、TypeオブジェクトはFlyweightで共有
        int[][] trees = {
            {1, 2}, {5, 3}, {10, 7}, {2, 8}, {6, 1}
        };

        for (int[] pos : trees) {
            TreeType oak = TreeFactory.get("オーク", "緑");
            oak.draw(pos[0], pos[1]);
        }

        TreeFactory.get("松", "濃緑").draw(20, 30);

        System.out.println("\\nTreeTypeオブジェクト数: "
            + TreeFactory.getPoolSize() + " (木の本数: 6)");
    }
}`,
    output: `TreeType生成: オーク
緑のオーク at (1,2)
緑のオーク at (5,3)
緑のオーク at (10,7)
緑のオーク at (2,8)
緑のオーク at (6,1)
TreeType生成: 松
濃緑の松 at (20,30)

TreeTypeオブジェクト数: 2 (木の本数: 6)`,
    tip: "内部状態（Intrinsic）は共有されるオブジェクトに保存し、外部状態（Extrinsic）はクライアントから渡す設計にします。",
  },
  // Behavioral
  {
    id: "observer",
    name: "Observer",
    category: "behavioral",
    emoji: "👁️",
    tagline: "状態変化を自動通知",
    overview:
      "Observerパターンは、オブジェクトの状態変化を複数の依存オブジェクトに自動的に通知するパターンです。\n\n【主なユースケース】\n• イベントシステム\n• MVCのModel→View通知\n• リアルタイム株価表示",
    diagram: `┌─────────────────┐           ┌──────────────┐
│    Subject      │           │   Observer   │
│   (interface)   │           │  (interface) │
├─────────────────┤  notifies ├──────────────┤
│+attach(obs)     │──────────▶│+update()     │
│+detach(obs)     │           └──────┬───────┘
│+notify()        │                  │
└────────┬────────┘     ┌────────────┴──────────┐
         │              │                       │
┌────────▼────────┐  ┌──▼──────────┐  ┌─────────▼────┐
│ConcreteSubject  │  │ConcreteObs A│  │ConcreteObs B │
└─────────────────┘  └─────────────┘  └──────────────┘`,
    code: `import java.util.ArrayList;
import java.util.List;

// Observer
interface StockObserver {
    void update(String stock, int price);
}

// Subject
class StockMarket {
    private List<StockObserver> observers = new ArrayList<>();
    private String stockName;
    private int price;

    public void addObserver(StockObserver o) { observers.add(o); }
    public void removeObserver(StockObserver o) { observers.remove(o); }

    public void setPrice(String stock, int price) {
        this.stockName = stock;
        this.price = price;
        notifyObservers();
    }

    private void notifyObservers() {
        for (StockObserver o : observers) {
            o.update(stockName, price);
        }
    }
}

// ConcreteObserver
class MobileApp implements StockObserver {
    public void update(String stock, int price) {
        System.out.println("[📱 Mobile] " + stock + ": " + price + "円");
    }
}

class EmailAlert implements StockObserver {
    private int threshold;
    EmailAlert(int threshold) { this.threshold = threshold; }

    public void update(String stock, int price) {
        if (price > threshold) {
            System.out.println("[📧 Email] アラート！"
                + stock + "が" + price + "円を超えました");
        }
    }
}

public class Main {
    public static void main(String[] args) {
        StockMarket market = new StockMarket();
        market.addObserver(new MobileApp());
        market.addObserver(new EmailAlert(1500));

        market.setPrice("Toyota", 1200);
        market.setPrice("Sony", 1600);
    }
}`,
    output: `[📱 Mobile] Toyota: 1200円
[📱 Mobile] Sony: 1600円
[📧 Email] アラート！Sonyが1600円を超えました`,
    tip: "JavaにはObservableクラスとObserverインターフェースがありましたが、Java9でdeprecatedになりました。現在はjava.beans.PropertyChangeListenerなどを使用します。",
  },
  {
    id: "strategy",
    name: "Strategy",
    category: "behavioral",
    emoji: "♟️",
    tagline: "アルゴリズムを差し替え可能に",
    overview:
      "Strategyパターンは、アルゴリズムのファミリーを定義し、それぞれをカプセル化して交換可能にするパターンです。\n\n【主なユースケース】\n• ソートアルゴリズムの切り替え\n• 支払い方法の切り替え\n• 圧縮アルゴリズム",
    diagram: `┌─────────────┐         ┌───────────────┐
│   Context   │────────▶│    Strategy   │
├─────────────┤         │  (interface)  │
│-strategy:S  │         ├───────────────┤
│+setStrategy │         │+execute()     │
│+doWork()    │         └───────┬───────┘
└─────────────┘      ┌──────────┼──────────┐
                ┌────▼────┐ ┌───▼────┐ ┌───▼────┐
                │Concrete │ │Concrt  │ │Concrt  │
                │Strategy │ │Strat B │ │Strat C │
                └─────────┘ └────────┘ └────────┘`,
    code: `// Strategy
interface SortStrategy {
    void sort(int[] data);
}

// ConcreteStrategy
class BubbleSort implements SortStrategy {
    public void sort(int[] data) {
        System.out.print("バブルソート: ");
        int[] d = data.clone();
        for (int i = 0; i < d.length; i++)
            for (int j = 0; j < d.length-1-i; j++)
                if (d[j] > d[j+1]) { int t = d[j]; d[j] = d[j+1]; d[j+1] = t; }
        for (int n : d) System.out.print(n + " ");
        System.out.println();
    }
}

class QuickSort implements SortStrategy {
    public void sort(int[] data) {
        System.out.print("クイックソート: ");
        int[] d = data.clone();
        java.util.Arrays.sort(d);
        for (int n : d) System.out.print(n + " ");
        System.out.println();
    }
}

// Context
class Sorter {
    private SortStrategy strategy;

    public void setStrategy(SortStrategy s) { this.strategy = s; }

    public void sort(int[] data) {
        strategy.sort(data);
    }
}

public class Main {
    public static void main(String[] args) {
        int[] data = {5, 3, 8, 1, 9, 2};
        Sorter sorter = new Sorter();

        sorter.setStrategy(new BubbleSort());
        sorter.sort(data);

        sorter.setStrategy(new QuickSort());
        sorter.sort(data);
    }
}`,
    output: `バブルソート: 1 2 3 5 8 9 
クイックソート: 1 2 3 5 8 9 `,
    tip: "if-elseやswitch文の代替として使えます。新しいアルゴリズムを追加する際も既存コードを変更しません（開放閉鎖原則）。",
  },
  {
    id: "command",
    name: "Command",
    category: "behavioral",
    emoji: "📝",
    tagline: "操作をオブジェクトとしてカプセル化",
    overview:
      "Commandパターンは、リクエストをオブジェクトとしてカプセル化し、操作の取り消し、再実行、キューイングを可能にします。\n\n【主なユースケース】\n• Undo/Redo\n• マクロ記録\n• トランザクション処理",
    diagram: `┌──────────┐  ┌───────────────┐  ┌──────────┐
│ Invoker  │──▶│    Command    │──▶│ Receiver │
├──────────┤  │  (interface)  │  ├──────────┤
│+execute()│  ├───────────────┤  │+action() │
└──────────┘  │+execute()     │  └──────────┘
              │+undo()        │
              └───────┬───────┘
                      │
            ┌─────────┴──────────┐
    ┌───────▼──────┐  ┌──────────▼───┐
    │ConcreteCmd A │  │ConcreteCmd B │
    └──────────────┘  └──────────────┘`,
    code: `import java.util.Stack;

// Receiver
class TextEditor {
    private StringBuilder text = new StringBuilder();

    public void append(String s) { text.append(s); }
    public void delete(int length) {
        int end = text.length();
        text.delete(Math.max(0, end - length), end);
    }
    public String getText() { return text.toString(); }
}

// Command
interface Command {
    void execute();
    void undo();
}

// ConcreteCommand
class AppendCommand implements Command {
    private TextEditor editor;
    private String text;

    AppendCommand(TextEditor editor, String text) {
        this.editor = editor;
        this.text = text;
    }

    public void execute() { editor.append(text); }
    public void undo() { editor.delete(text.length()); }
}

// Invoker（履歴管理）
class CommandManager {
    private Stack<Command> history = new Stack<>();

    public void execute(Command cmd) {
        cmd.execute();
        history.push(cmd);
    }

    public void undo() {
        if (!history.isEmpty()) history.pop().undo();
    }
}

public class Main {
    public static void main(String[] args) {
        TextEditor editor = new TextEditor();
        CommandManager mgr = new CommandManager();

        mgr.execute(new AppendCommand(editor, "Hello"));
        System.out.println(editor.getText());

        mgr.execute(new AppendCommand(editor, ", World"));
        System.out.println(editor.getText());

        System.out.println("-- Undo --");
        mgr.undo();
        System.out.println(editor.getText());

        mgr.undo();
        System.out.println(editor.getText());
    }
}`,
    output: `Hello
Hello, World
-- Undo --
Hello
`,
    tip: "Macのcommand+Z、VS Codeの元に戻す機能など、GUIアプリケーションのUndo/Redoはほぼこのパターンで実装されています。",
  },
  {
    id: "template_method",
    name: "Template Method",
    category: "behavioral",
    emoji: "📐",
    tagline: "アルゴリズムの骨格を定義",
    overview:
      "Template Methodパターンは、アルゴリズムのスケルトンをスーパークラスで定義し、一部のステップをサブクラスに委ねるパターンです。\n\n【主なユースケース】\n• フレームワークのフック\n• データ処理パイプライン\n• ゲームのAI行動",
    diagram: `┌────────────────────────────┐
│   AbstractClass            │
├────────────────────────────┤
│ + templateMethod()         │ ← final
│   step1() ──────────────── │ ← 具体的な処理
│   step2() ──────────────── │ ← abstract
│   step3() ──────────────── │ ← hook (optional)
└────────────┬───────────────┘
       ┌─────┴──────┐
┌──────▼─────┐  ┌───▼────────┐
│ConcreteA   │  │ConcreteB   │
│+step2()    │  │+step2()    │
└────────────┘  └────────────┘`,
    code: `// AbstractClass
abstract class DataProcessor {
    // テンプレートメソッド（変更不可）
    public final void process() {
        readData();
        processData();
        writeResult();
    }

    private void readData() {
        System.out.println("[共通] データ読み込み開始");
    }

    // サブクラスで実装
    protected abstract void processData();

    private void writeResult() {
        System.out.println("[共通] 結果書き込み完了\\n");
    }
}

// ConcreteClass
class CSVProcessor extends DataProcessor {
    @Override
    protected void processData() {
        System.out.println("[CSV] カンマ区切りでパース");
        System.out.println("[CSV] 数値データを集計");
    }
}

class JSONProcessor extends DataProcessor {
    @Override
    protected void processData() {
        System.out.println("[JSON] JSONをパース");
        System.out.println("[JSON] ネストされた構造を展開");
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("=== CSV処理 ===");
        new CSVProcessor().process();

        System.out.println("=== JSON処理 ===");
        new JSONProcessor().process();
    }
}`,
    output: `=== CSV処理 ===
[共通] データ読み込み開始
[CSV] カンマ区切りでパース
[CSV] 数値データを集計
[共通] 結果書き込み完了

=== JSON処理 ===
[共通] データ読み込み開始
[JSON] JSONをパース
[JSON] ネストされた構造を展開
[共通] 結果書き込み完了`,
    tip: "Hollywood Principle「Don't call us, we'll call you」の典型例。フレームワーク側がサブクラスのメソッドを呼び出す構造です。",
  },
  {
    id: "iterator",
    name: "Iterator",
    category: "behavioral",
    emoji: "🔁",
    tagline: "コレクションを統一的に走査",
    overview:
      "Iteratorパターンは、コレクションの内部表現を公開せずに、その要素に順次アクセスする方法を提供します。\n\n【主なユースケース】\n• カスタムコレクション\n• データベースカーソル\n• ツリーの走査",
    diagram: `┌──────────────┐  uses  ┌────────────────┐
│   Client     │───────▶│    Iterator    │
└──────────────┘        │  (interface)   │
       │                ├────────────────┤
       │                │+hasNext():bool │
       ▼                │+next(): T      │
┌──────────────┐        └───────┬────────┘
│  Aggregate   │                │
│ (interface)  │        ┌───────▼────────┐
├──────────────┤        │ConcreteIterator│
│+iterator()   │        └────────────────┘
└──────┬───────┘
       │
┌──────▼───────┐
│ConcreteAggr  │
└──────────────┘`,
    code: `import java.util.Iterator;

// Aggregate（Javaの標準インターフェースを使用）
class BookShelf implements Iterable<String> {
    private String[] books;
    private int count = 0;

    public BookShelf(int capacity) {
        this.books = new String[capacity];
    }

    public void addBook(String book) {
        if (count < books.length) {
            books[count++] = book;
        }
    }

    // Iterator生成
    @Override
    public Iterator<String> iterator() {
        return new BookIterator();
    }

    // Inner ConcreteIterator
    private class BookIterator implements Iterator<String> {
        private int index = 0;

        @Override
        public boolean hasNext() { return index < count; }

        @Override
        public String next() { return books[index++]; }
    }
}

public class Main {
    public static void main(String[] args) {
        BookShelf shelf = new BookShelf(5);
        shelf.addBook("Clean Code");
        shelf.addBook("Design Patterns");
        shelf.addBook("Refactoring");
        shelf.addBook("The Pragmatic Programmer");

        // for-each構文で使用可能
        System.out.println("=== 書棚 ===");
        for (String book : shelf) {
            System.out.println("📗 " + book);
        }
    }
}`,
    output: `=== 書棚 ===
📗 Clean Code
📗 Design Patterns
📗 Refactoring
📗 The Pragmatic Programmer`,
    tip: "JavaのCollections（List, Set, Map）はIterableを実装しており、for-each構文が使えるのはIteratorパターンのおかげです。",
  },
  {
    id: "state",
    name: "State",
    category: "behavioral",
    emoji: "🚦",
    tagline: "状態に応じて振る舞いを変更",
    overview:
      "Stateパターンは、オブジェクトの内部状態が変わると振る舞いが変わるように見えるパターンです。状態を表すオブジェクトを切り替えることで実現します。\n\n【主なユースケース】\n• 自動販売機\n• 信号機\n• ゲームのキャラクター状態",
    diagram: `┌──────────────────┐         ┌─────────────┐
│     Context      │────────▶│    State    │
├──────────────────┤         │ (interface) │
│-state: State     │         ├─────────────┤
│+request()        │         │+handle(ctx) │
│+setState(state)  │         └──────┬──────┘
└──────────────────┘    ┌──────────┴──────────┐
                   ┌────▼──────┐       ┌───────▼────┐
                   │StateA     │       │StateB      │
                   │+handle()  │       │+handle()   │
                   └───────────┘       └────────────┘`,
    code: `// State
interface VendingState {
    void insertCoin(VendingMachine machine);
    void selectItem(VendingMachine machine);
}

// Context
class VendingMachine {
    private VendingState state;

    public VendingMachine() {
        this.state = new IdleState();
    }

    public void setState(VendingState state) { this.state = state; }

    public void insertCoin() { state.insertCoin(this); }
    public void selectItem() { state.selectItem(this); }
}

// ConcreteState: 待機中
class IdleState implements VendingState {
    public void insertCoin(VendingMachine m) {
        System.out.println("コイン投入OK。商品を選んでください");
        m.setState(new CoinInsertedState());
    }
    public void selectItem(VendingMachine m) {
        System.out.println("先にコインを入れてください");
    }
}

// ConcreteState: コイン投入済み
class CoinInsertedState implements VendingState {
    public void insertCoin(VendingMachine m) {
        System.out.println("コインは既に投入されています");
    }
    public void selectItem(VendingMachine m) {
        System.out.println("商品を提供します！");
        m.setState(new IdleState());
    }
}

public class Main {
    public static void main(String[] args) {
        VendingMachine vm = new VendingMachine();

        vm.selectItem();    // コインなし
        vm.insertCoin();    // コイン投入
        vm.insertCoin();    // 2回目
        vm.selectItem();    // 購入
        vm.selectItem();    // 購入後
    }
}`,
    output: `先にコインを入れてください
コイン投入OK。商品を選んでください
コインは既に投入されています
商品を提供します！
先にコインを入れてください`,
    tip: "条件分岐（if-else、switch）の代わりにStateパターンを使うと、新しい状態の追加が容易になります。",
  },
  {
    id: "chain_of_responsibility",
    name: "Chain of Responsibility",
    category: "behavioral",
    emoji: "⛓️",
    tagline: "処理を連鎖的に委譲",
    overview:
      "Chain of Responsibilityパターンは、リクエストの送信者と受信者を分離し、複数のハンドラーを連鎖させてリクエストを処理するパターンです。\n\n【主なユースケース】\n• ログレベル処理\n• 承認フロー\n• HTTPミドルウェア",
    diagram: `Client──▶Handler──▶Handler──▶Handler──▶null
              (A)       (B)       (C)
            handles   passes    handles
            request   to next   request

┌──────────────────────┐
│      Handler         │
│     (abstract)       │
├──────────────────────┤
│-next: Handler        │
│+setNext(h): Handler  │
│+handle(req): void    │
└──────────────────────┘`,
    code: `// Handler
abstract class ApprovalHandler {
    protected ApprovalHandler next;

    public ApprovalHandler setNext(ApprovalHandler next) {
        this.next = next;
        return next;
    }

    public abstract void approve(int amount);
}

// ConcreteHandler
class TeamLeader extends ApprovalHandler {
    public void approve(int amount) {
        if (amount <= 10000) {
            System.out.println("チームリーダーが承認: " + amount + "円");
        } else if (next != null) {
            System.out.println("チームリーダー権限外→上長へ");
            next.approve(amount);
        }
    }
}

class Manager extends ApprovalHandler {
    public void approve(int amount) {
        if (amount <= 100000) {
            System.out.println("マネージャーが承認: " + amount + "円");
        } else if (next != null) {
            System.out.println("マネージャー権限外→部長へ");
            next.approve(amount);
        }
    }
}

class Director extends ApprovalHandler {
    public void approve(int amount) {
        System.out.println("部長が承認: " + amount + "円");
    }
}

public class Main {
    public static void main(String[] args) {
        TeamLeader tl = new TeamLeader();
        Manager mg = new Manager();
        Director dr = new Director();

        // チェーン構築
        tl.setNext(mg).setNext(dr);

        int[] requests = {5000, 50000, 500000};
        for (int amt : requests) {
            System.out.println("\\n申請: " + amt + "円");
            tl.approve(amt);
        }
    }
}`,
    output: `
申請: 5000円
チームリーダーが承認: 5000円

申請: 50000円
チームリーダー権限外→上長へ
マネージャーが承認: 50000円

申請: 500000円
チームリーダー権限外→上長へ
マネージャー権限外→部長へ
部長が承認: 500000円`,
    tip: "JavaのServletフィルター、Springのインターセプター、Node.jsのミドルウェア（Expressのapp.use）はこのパターンを使っています。",
  },
  {
    id: "mediator",
    name: "Mediator",
    category: "behavioral",
    emoji: "📡",
    tagline: "オブジェクト間の通信を仲介",
    overview:
      "Mediatorパターンは、オブジェクト間の通信を仲介者オブジェクトに集中させ、オブジェクト同士の依存関係を減らすパターンです。\n\n【主なユースケース】\n• チャットシステム\n• GUIコンポーネントの連携\n• ATCシステム",
    diagram: `┌────────────────────────────────┐
│           Mediator             │
│          (interface)           │
├────────────────────────────────┤
│+notify(sender, event): void    │
└────────────┬───────────────────┘
             │
    ┌────────▼──────────┐
    │  ConcreteMediator │
    └─────┬──────┬──────┘
          │      │
    ┌─────▼──┐ ┌─▼──────┐
    │Comp A  │ │Comp B  │
    └────────┘ └────────┘`,
    code: `import java.util.ArrayList;
import java.util.List;

// Mediator
interface ChatMediator {
    void sendMessage(String message, User sender);
    void addUser(User user);
}

// ConcreteMediator
class ChatRoom implements ChatMediator {
    private List<User> users = new ArrayList<>();

    public void addUser(User user) { users.add(user); }

    public void sendMessage(String message, User sender) {
        for (User user : users) {
            if (user != sender) {
                user.receive(sender.getName() + ": " + message);
            }
        }
    }
}

// Colleague
class User {
    private String name;
    private ChatMediator mediator;

    User(String name, ChatMediator mediator) {
        this.name = name;
        this.mediator = mediator;
        mediator.addUser(this);
    }

    public String getName() { return name; }

    public void send(String message) {
        System.out.println("[送信] " + name + " → " + message);
        mediator.sendMessage(message, this);
    }

    public void receive(String message) {
        System.out.println("[受信] " + name + " ← " + message);
    }
}

public class Main {
    public static void main(String[] args) {
        ChatMediator room = new ChatRoom();
        User alice = new User("Alice", room);
        User bob = new User("Bob", room);
        User charlie = new User("Charlie", room);

        alice.send("みなさんこんにちは！");
        System.out.println();
        bob.send("やあAlice！");
    }
}`,
    output: `[送信] Alice → みなさんこんにちは！
[受信] Bob ← Alice: みなさんこんにちは！
[受信] Charlie ← Alice: みなさんこんにちは！

[送信] Bob → やあAlice！
[受信] Alice ← Bob: やあAlice！
[受信] Charlie ← Bob: やあAlice！`,
    tip: "多対多の依存関係を多対一に変換できますが、Mediator自体が巨大になりすぎないよう設計に注意が必要です。",
  },
  {
    id: "memento",
    name: "Memento",
    category: "behavioral",
    emoji: "💾",
    tagline: "状態のスナップショットを保存",
    overview:
      "Mementoパターンは、オブジェクトの内部状態をカプセル化を壊すことなく保存・復元するパターンです。\n\n【主なユースケース】\n• テキストエディタのUndo\n• ゲームのセーブデータ\n• トランザクションのロールバック",
    diagram: `┌──────────────┐  creates ┌──────────────┐
│  Originator  │─────────▶│   Memento    │
├──────────────┤          ├──────────────┤
│-state        │          │-state        │
│+saveState()  │◀─────────│+getState()   │
│+restoreState │  uses    └──────────────┘
└──────────────┘                ▲
                                │ stores
                       ┌────────┴───────┐
                       │   Caretaker    │
                       ├────────────────┤
                       │-history: List  │
                       │+save()         │
                       │+undo()         │
                       └────────────────┘`,
    code: `import java.util.Stack;

// Memento
class GameMemento {
    private final int level;
    private final int score;
    private final String position;

    GameMemento(int level, int score, String position) {
        this.level = level;
        this.score = score;
        this.position = position;
    }

    int getLevel() { return level; }
    int getScore() { return score; }
    String getPosition() { return position; }
}

// Originator
class GameCharacter {
    private int level;
    private int score;
    private String position;

    GameCharacter(int level, int score, String position) {
        this.level = level;
        this.score = score;
        this.position = position;
    }

    public GameMemento save() {
        System.out.println("セーブ！ " + getStatus());
        return new GameMemento(level, score, position);
    }

    public void restore(GameMemento m) {
        this.level = m.getLevel();
        this.score = m.getScore();
        this.position = m.getPosition();
        System.out.println("ロード！ " + getStatus());
    }

    public void play(String newPos, int addScore) {
        this.position = newPos;
        this.score += addScore;
        System.out.println("プレイ中: " + getStatus());
    }

    private String getStatus() {
        return "Lv" + level + " Score:" + score + " @" + position;
    }
}

// Caretaker
class SaveManager {
    private Stack<GameMemento> history = new Stack<>();

    public void save(GameCharacter character) {
        history.push(character.save());
    }

    public void load(GameCharacter character) {
        if (!history.isEmpty()) character.restore(history.pop());
    }
}

public class Main {
    public static void main(String[] args) {
        GameCharacter hero = new GameCharacter(1, 0, "スタート地点");
        SaveManager saves = new SaveManager();

        saves.save(hero);
        hero.play("森", 100);
        hero.play("ダンジョン", 500);
        saves.save(hero);
        hero.play("ボス部屋", 200);
        System.out.println("\\n-- ロード --");
        saves.load(hero);
    }
}`,
    output: `セーブ！ Lv1 Score:0 @スタート地点
プレイ中: Lv1 Score:100 @森
プレイ中: Lv1 Score:600 @ダンジョン
セーブ！ Lv1 Score:600 @ダンジョン
プレイ中: Lv1 Score:800 @ボス部屋

-- ロード --
ロード！ Lv1 Score:600 @ダンジョン`,
    tip: "MementoのstateはOriginatorのみがアクセスできる仕組みが理想的です。Javaではinner classやパッケージプライベートで実現できます。",
  },
  {
    id: "visitor",
    name: "Visitor",
    category: "behavioral",
    emoji: "🏃",
    tagline: "データ構造と処理を分離",
    overview:
      "Visitorパターンは、データ構造と処理を分離し、新しい処理を既存のクラスを変更せずに追加できるようにするパターンです。\n\n【主なユースケース】\n• コンパイラのAST処理\n• ドキュメントのエクスポート\n• レポート生成",
    diagram: `┌─────────────────┐      ┌──────────────────┐
│    Element      │      │     Visitor      │
│   (interface)   │      │   (interface)    │
├─────────────────┤      ├──────────────────┤
│+accept(Visitor) │      │+visitA(elemA)    │
└────────┬────────┘      │+visitB(elemB)    │
    ┌────┴──────┐        └──────────┬───────┘
┌───▼────┐ ┌───▼────┐   ┌──────────┴────────┐
│ElemA   │ │ElemB   │   │ConcreteVisitor1/2  │
│+accept │ │+accept │   └────────────────────┘
└────────┘ └────────┘`,
    code: `// Element
interface Shape {
    void accept(ShapeVisitor visitor);
    double getArea();
}

// ConcreteElement
class Circle implements Shape {
    double radius;
    Circle(double radius) { this.radius = radius; }
    public double getArea() { return Math.PI * radius * radius; }
    public void accept(ShapeVisitor visitor) { visitor.visitCircle(this); }
}

class Rectangle implements Shape {
    double width, height;
    Rectangle(double w, double h) { this.width = w; this.height = h; }
    public double getArea() { return width * height; }
    public void accept(ShapeVisitor visitor) { visitor.visitRectangle(this); }
}

// Visitor
interface ShapeVisitor {
    void visitCircle(Circle circle);
    void visitRectangle(Rectangle rect);
}

// ConcreteVisitor: 面積計算
class AreaVisitor implements ShapeVisitor {
    public void visitCircle(Circle c) {
        System.out.printf("円(r=%.1f) 面積: %.2f%n", c.radius, c.getArea());
    }
    public void visitRectangle(Rectangle r) {
        System.out.printf("長方形(%.1fx%.1f) 面積: %.2f%n",
            r.width, r.height, r.getArea());
    }
}

// ConcreteVisitor: HTML出力
class HTMLVisitor implements ShapeVisitor {
    public void visitCircle(Circle c) {
        System.out.println("<circle r=\\"" + c.radius + "\\" />");
    }
    public void visitRectangle(Rectangle r) {
        System.out.println("<rect w=\\"" + r.width
            + "\\" h=\\"" + r.height + "\\" />");
    }
}

public class Main {
    public static void main(String[] args) {
        Shape[] shapes = {
            new Circle(5), new Rectangle(4, 6), new Circle(3)
        };

        System.out.println("=== 面積計算 ===");
        AreaVisitor area = new AreaVisitor();
        for (Shape s : shapes) s.accept(area);

        System.out.println("\\n=== HTML出力 ===");
        HTMLVisitor html = new HTMLVisitor();
        for (Shape s : shapes) s.accept(html);
    }
}`,
    output: `=== 面積計算 ===
円(r=5.0) 面積: 78.54
長方形(4.0x6.0) 面積: 24.00
円(r=3.0) 面積: 28.27

=== HTML出力 ===
<circle r="5.0" />
<rect w="4.0" h="6.0" />
<circle r="3.0" />`,
    tip: "データ構造（Element）に新しいクラスを追加する場合は全Visitorの変更が必要になります。追加するものがVisitor（処理）なのかElement（データ）なのかで使いどころが変わります。",
  },
  {
    id: "interpreter",
    name: "Interpreter",
    category: "behavioral",
    emoji: "💬",
    tagline: "言語の文法を定義・解釈",
    overview:
      "Interpreterパターンは、特定の言語の文法を定義し、その言語で記述された文を解釈するパターンです。\n\n【主なユースケース】\n• 正規表現\n• SQL解析\n• 数式評価器",
    diagram: `┌────────────────────┐
│    AbstractExpression│
├────────────────────┤
│+interpret(context) │
└───────┬────────────┘
  ┌─────┴──────┐
┌─▼──────────┐ ┌─▼──────────────┐
│ Terminal   │ │  NonTerminal   │
│ Expression │ │  Expression    │
├────────────┤ ├────────────────┤
│+interpret()│ │-exprs: List    │
└────────────┘ │+interpret()    │
               └────────────────┘`,
    code: `import java.util.Stack;

// Context & Expression
interface Expression {
    int interpret();
}

// Terminal: 数値
class NumberExpression implements Expression {
    private int number;
    NumberExpression(int number) { this.number = number; }
    public int interpret() { return number; }
}

// NonTerminal: 加算
class AddExpression implements Expression {
    private Expression left, right;
    AddExpression(Expression l, Expression r) {
        this.left = l; this.right = r;
    }
    public int interpret() {
        return left.interpret() + right.interpret();
    }
}

// NonTerminal: 減算
class SubtractExpression implements Expression {
    private Expression left, right;
    SubtractExpression(Expression l, Expression r) {
        this.left = l; this.right = r;
    }
    public int interpret() {
        return left.interpret() - right.interpret();
    }
}

// 逆ポーランド記法パーサー
class RPNParser {
    public static Expression parse(String expr) {
        Stack<Expression> stack = new Stack<>();
        for (String token : expr.split(" ")) {
            switch (token) {
                case "+":
                    Expression r1 = stack.pop(), l1 = stack.pop();
                    stack.push(new AddExpression(l1, r1));
                    break;
                case "-":
                    Expression r2 = stack.pop(), l2 = stack.pop();
                    stack.push(new SubtractExpression(l2, r2));
                    break;
                default:
                    stack.push(new NumberExpression(Integer.parseInt(token)));
            }
        }
        return stack.pop();
    }
}

public class Main {
    public static void main(String[] args) {
        String[] exprs = {"3 4 +", "10 3 -", "5 3 + 2 -"};
        for (String expr : exprs) {
            Expression e = RPNParser.parse(expr);
            System.out.println(expr + " = " + e.interpret());
        }
    }
}`,
    output: `3 4 + = 7
10 3 - = 7
5 3 + 2 - = 6`,
    tip: "複雑な文法には向かず、パーサーコンビネーターやパーサージェネレーター（ANTLR等）の方が適しています。シンプルなDSLやルールエンジンに活用されます。",
  },
];

const STEPS = [
  { id: "overview", label: "概要", icon: "📖" },
  { id: "diagram", label: "クラス図", icon: "📊" },
  { id: "code", label: "実装", icon: "💻" },
  { id: "run", label: "実行", icon: "▶" },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [completedPatterns, setCompletedPatterns] = useState(new Set());
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [animateIn, setAnimateIn] = useState(false);

  const filteredPatterns =
    selectedCategory === "all"
      ? PATTERNS
      : PATTERNS.filter((p) => p.category === selectedCategory);

  const selectPattern = (pattern) => {
    setSelectedPattern(pattern);
    setCurrentStep(0);
    setShowOutput(false);
    setIsRunning(false);
    setCompletedSteps(new Set());
    setAnimateIn(true);
    setTimeout(() => setAnimateIn(false), 400);
  };

  const goToStep = (idx) => {
    setCurrentStep(idx);
    setShowOutput(false);
    const newCompleted = new Set(completedSteps);
    for (let i = 0; i < idx; i++) newCompleted.add(i);
    setCompletedSteps(newCompleted);
  };

  const handleNext = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep);
    setCompletedSteps(newCompleted);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowOutput(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setShowOutput(false);
    await new Promise((r) => setTimeout(r, 600));
    await new Promise((r) => setTimeout(r, 500));
    setIsRunning(false);
    setShowOutput(true);
    const newCompleted = new Set(completedSteps);
    newCompleted.add(3);
    setCompletedSteps(newCompleted);
    const newCompletedPatterns = new Set(completedPatterns);
    newCompletedPatterns.add(selectedPattern.id);
    setCompletedPatterns(newCompletedPatterns);
  };

  const progress = Math.round(
    (completedPatterns.size / PATTERNS.length) * 100
  );

  const catCounts = Object.keys(CATEGORIES).reduce((acc, cat) => {
    acc[cat] = PATTERNS.filter((p) => p.category === cat).length;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: "'Fira Code', 'Courier New', monospace", backgroundColor: "#030712" }}
      className="min-h-screen bg-gray-950 text-gray-100">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;600;700&display=swap');
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        
        .slide-in {
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .pulse-dot {
          animation: pulse 1.2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .pattern-card:hover {
          transform: translateY(-2px);
          transition: all 0.15s ease;
        }
        .pattern-card {
          transition: all 0.15s ease;
        }
        .category-btn {
          transition: all 0.15s ease;
        }
        .step-dot {
          transition: all 0.2s ease;
        }
        code, pre { font-family: 'Fira Code', monospace; }
        
        .typing-cursor::after {
          content: '█';
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e293b", background: "rgba(15,23,42,0.95)" }}
        className="sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span style={{ color: "#4ade80", fontSize: "1.3rem", fontWeight: 700 }}>GoF</span>
              <span style={{ color: "#64748b", margin: "0 6px" }}>/</span>
              <span style={{ color: "#e2e8f0", fontSize: "1.1rem", fontWeight: 600 }}>デザインパターン</span>
              <span style={{ color: "#334155", margin: "0 6px" }}>—</span>
              <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Java 実装集</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
              <span style={{ color: "#4ade80", fontWeight: 600 }}>{completedPatterns.size}</span>
              <span style={{ color: "#334155" }}>/</span>
              <span>{PATTERNS.length} 完了</span>
            </div>
            <div style={{ width: 120, height: 4, background: "#1e293b", borderRadius: 2 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #4ade80, #22d3ee)", borderRadius: 2, transition: "width 0.5s ease" }} />
            </div>
            <span style={{ color: "#4ade80", fontSize: "0.8rem", fontWeight: 600 }}>{progress}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex" style={{ minHeight: "calc(100vh - 65px)" }}>
        
        {/* Sidebar */}
        <div style={{ width: 300, borderRight: "1px solid #1e293b", background: "#0a0f1a", flexShrink: 0, overflowY: "hidden", height: "calc(100vh - 65px)" }}
          className="flex flex-col">
          
          {/* Category Filters */}
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #1e293b" }}>
            <div style={{ color: "#334155", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: 10 }}>
              CATEGORY
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSelectedCategory("all")}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: selectedCategory === "all" ? "#1e293b" : "transparent",
                  border: selectedCategory === "all" ? "1px solid #334155" : "1px solid transparent",
                  color: selectedCategory === "all" ? "#e2e8f0" : "#64748b",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
                className="category-btn"
              >
                <span>🗂️ 全パターン</span>
                <span style={{ color: "#4ade80", fontSize: "0.7rem" }}>{PATTERNS.length}</span>
              </button>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: selectedCategory === key ? cat.bg : "transparent",
                    border: selectedCategory === key ? `1px solid ${cat.color}40` : "1px solid transparent",
                    color: selectedCategory === key ? cat.color : "#64748b",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                  className="category-btn"
                >
                  <span>{cat.icon} {cat.label}</span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{catCounts[key]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pattern List */}
          <div className="flex-1 overflow-y-auto" style={{ padding: "12px 8px" }}>
            {Object.entries(CATEGORIES).map(([catKey, cat]) => {
              const patterns = filteredPatterns.filter(p => p.category === catKey);
              if (patterns.length === 0) return null;
              return (
                <div key={catKey} className="mb-4">
                  {selectedCategory === "all" && (
                    <div style={{ color: cat.color, fontSize: "0.65rem", letterSpacing: "0.08em", padding: "0 8px", marginBottom: 6, opacity: 0.7 }}>
                      {cat.label.toUpperCase()}
                    </div>
                  )}
                  {patterns.map((pattern) => {
                    const isActive = selectedPattern?.id === pattern.id;
                    const isDone = completedPatterns.has(pattern.id);
                    const catColor = CATEGORIES[pattern.category].color;
                    return (
                      <button
                        key={pattern.id}
                        onClick={() => selectPattern(pattern)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: isActive ? `${catColor}15` : "transparent",
                          border: isActive ? `1px solid ${catColor}40` : "1px solid transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 2,
                          color: isActive ? catColor : isDone ? "#94a3b8" : "#475569"
                        }}
                        className="pattern-card"
                      >
                        <span style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}>{pattern.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", color: isActive ? catColor : isDone ? "#94a3b8" : "#64748b" }}>
                            {pattern.name}
                          </div>
                        </div>
                        {isDone && (
                          <span style={{ color: "#4ade80", fontSize: "0.7rem", flexShrink: 0 }}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-scroll" style={{height: 'calc(100vh - 65px)'}}>
          {!selectedPattern ? (
            // Welcome Screen
            <div className="flex-1 flex items-center justify-center" style={{ padding: 40 }}>
              <div style={{ textAlign: "center", maxWidth: 480 }}>
                <div style={{ fontSize: "3rem", marginBottom: 20 }}>🎯</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>
                  GoF デザインパターン 全23種
                </div>
                <div style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 32 }}>
                  左のパターン一覧から学びたいパターンを選択してください。
                  概要 → クラス図 → 実装 → 実行 の4ステップで体系的に学べます。
                </div>
                <div className="flex justify-center gap-6">
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <div key={key} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem" }}>{cat.icon}</div>
                      <div style={{ color: cat.color, fontSize: "0.75rem", marginTop: 4, fontWeight: 600 }}>{cat.label}</div>
                      <div style={{ color: "#334155", fontSize: "0.7rem" }}>{catCounts[key]}種</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Pattern Header */}
              <div style={{ borderBottom: "1px solid #1e293b", padding: "16px 28px", background: "#0a0f1a" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span style={{ fontSize: "1.6rem" }}>{selectedPattern.emoji}</span>
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "#f1f5f9" }}>
                          {selectedPattern.name}
                        </h1>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: CATEGORIES[selectedPattern.category].bg,
                          border: `1px solid ${CATEGORIES[selectedPattern.category].color}40`,
                          color: CATEGORIES[selectedPattern.category].color,
                          fontSize: "0.7rem",
                          fontWeight: 600
                        }}>
                          {CATEGORIES[selectedPattern.category].label}
                        </span>
                      </div>
                      <div style={{ color: "#475569", fontSize: "0.8rem", marginTop: 2 }}>
                        {selectedPattern.tagline}
                      </div>
                    </div>
                  </div>
                  
                  {/* Step Navigator */}
                  <div className="flex items-center gap-2">
                    {STEPS.map((step, idx) => {
                      const isDone = completedSteps.has(idx);
                      const isActive = currentStep === idx;
                      const catColor = CATEGORIES[selectedPattern.category].color;
                      return (
                        <button
                          key={step.id}
                          onClick={() => goToStep(idx)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "5px 12px",
                            borderRadius: 20,
                            border: isActive ? `1px solid ${catColor}` : isDone ? "1px solid #334155" : "1px solid #1e293b",
                            background: isActive ? `${catColor}20` : isDone ? "#0f172a" : "transparent",
                            color: isActive ? catColor : isDone ? "#64748b" : "#334155",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: isActive ? 600 : 400,
                            transition: "all 0.15s"
                          }}
                          className="step-dot"
                        >
                          <span>{isDone && !isActive ? "✓" : step.icon}</span>
                          <span>{step.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className={`flex-1 overflow-y-auto ${animateIn ? "slide-in" : ""}`}
                style={{ padding: "28px 32px" }}>

                {/* Step 0: Overview */}
                {currentStep === 0 && (
                  <div style={{ maxWidth: 680 }}>
                    <div style={{ color: "#64748b", fontSize: "0.75rem", letterSpacing: "0.08em", marginBottom: 16 }}>
                      // OVERVIEW
                    </div>
                    <div style={{
                      background: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: 12,
                      padding: "24px 28px",
                      lineHeight: 1.8,
                      color: "#94a3b8",
                      fontSize: "0.9rem",
                      whiteSpace: "pre-line"
                    }}>
                      {selectedPattern.overview}
                    </div>
                  </div>
                )}

                {/* Step 1: Diagram */}
                {currentStep === 1 && (
                  <div style={{ maxWidth: 680 }}>
                    <div style={{ color: "#64748b", fontSize: "0.75rem", letterSpacing: "0.08em", marginBottom: 16 }}>
                      // CLASS DIAGRAM
                    </div>
                    <div style={{
                      background: "#0a0f1a",
                      border: `1px solid ${CATEGORIES[selectedPattern.category].color}30`,
                      borderRadius: 12,
                      overflow: "hidden"
                    }}>
                      <div style={{
                        background: "#0f172a",
                        borderBottom: "1px solid #1e293b",
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      }}>
                        <span style={{ color: CATEGORIES[selectedPattern.category].color, fontSize: "0.75rem" }}>
                          {selectedPattern.name}.puml
                        </span>
                      </div>
                      <pre style={{
                        padding: "24px 28px",
                        color: "#94a3b8",
                        fontSize: "0.82rem",
                        lineHeight: 1.6,
                        margin: 0,
                        fontFamily: "'Fira Code', monospace"
                      }}>
                        {selectedPattern.diagram}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Step 2: Code */}
                {currentStep === 2 && (
                  <div style={{ maxWidth: 760 }}>
                    <div style={{ color: "#64748b", fontSize: "0.75rem", letterSpacing: "0.08em", marginBottom: 16 }}>
                      // IMPLEMENTATION
                    </div>
                    <div style={{
                      background: "#0a0f1a",
                      border: "1px solid #1e293b",
                      borderRadius: 12,
                      overflow: "hidden"
                    }}>
                      <div style={{
                        background: "#0f172a",
                        borderBottom: "1px solid #1e293b",
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c940" }} />
                        <span style={{ color: "#475569", fontSize: "0.75rem", marginLeft: 8 }}>
                          {selectedPattern.name}.java
                        </span>
                      </div>
                      <pre style={{
                        padding: "20px 24px",
                        margin: 0,
                        fontSize: "0.82rem",
                        lineHeight: 1.6,
                        overflowX: "auto",
                        color: "#a5b4fc"
                      }}>
                        <code style={{ color: "#e2e8f0" }}>{selectedPattern.code}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Step 3: Run */}
                {currentStep === 3 && (
                  <div style={{ maxWidth: 760 }}>
                    <div style={{ color: "#64748b", fontSize: "0.75rem", letterSpacing: "0.08em", marginBottom: 16 }}>
                      // EXECUTION
                    </div>
                    
                    {/* Code */}
                    <div style={{
                      background: "#0a0f1a",
                      border: "1px solid #1e293b",
                      borderRadius: 12,
                      overflow: "hidden",
                      marginBottom: 16
                    }}>
                      <div style={{
                        background: "#0f172a",
                        borderBottom: "1px solid #1e293b",
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}>
                        <div className="flex items-center gap-2">
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c940" }} />
                          <span style={{ color: "#475569", fontSize: "0.75rem", marginLeft: 8 }}>Main.java</span>
                        </div>
                        {!showOutput && (
                          <button
                            onClick={handleRun}
                            disabled={isRunning}
                            style={{
                              padding: "4px 14px",
                              borderRadius: 4,
                              background: isRunning ? "#1e293b" : "#166534",
                              border: "none",
                              color: isRunning ? "#475569" : "#4ade80",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: isRunning ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6
                            }}
                          >
                            {isRunning ? (
                              <>
                                <span className="pulse-dot">●</span>
                                実行中...
                              </>
                            ) : "▶ 実行"}
                          </button>
                        )}
                      </div>
                      <pre style={{
                        padding: "16px 24px",
                        margin: 0,
                        fontSize: "0.78rem",
                        lineHeight: 1.6,
                        overflowX: "auto",
                        color: "#e2e8f0",
                        maxHeight: 280
                      }}>
                        <code>{selectedPattern.code}</code>
                      </pre>
                    </div>

                    {/* Running indicator */}
                    {isRunning && (
                      <div style={{
                        background: "#0f172a",
                        border: "1px solid #1e3a5f",
                        borderRadius: 8,
                        padding: "12px 16px",
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 10
                      }}>
                        <span className="pulse-dot" style={{ color: "#60a5fa", fontSize: "0.8rem" }}>●</span>
                        <span style={{ color: "#60a5fa", fontSize: "0.8rem" }}>コンパイル・実行中...</span>
                      </div>
                    )}

                    {/* Output */}
                    {showOutput && (
                      <div style={{
                        background: "#030712",
                        border: "1px solid #166534",
                        borderRadius: 12,
                        overflow: "hidden"
                      }}>
                        <div style={{
                          background: "#052e16",
                          borderBottom: "1px solid #166534",
                          padding: "8px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}>
                          <span style={{ color: "#4ade80", fontSize: "0.75rem" }}>● 実行結果</span>
                        </div>
                        <pre style={{
                          padding: "16px 24px",
                          margin: 0,
                          fontSize: "0.85rem",
                          lineHeight: 1.7,
                          color: "#4ade80",
                          fontFamily: "'Fira Code', monospace"
                        }}>
                          {selectedPattern.output}
                        </pre>
                      </div>
                    )}

                    {/* Tip */}
                    {showOutput && (
                      <div style={{
                        marginTop: 16,
                        background: "#1c1400",
                        border: "1px solid #854d0e40",
                        borderLeft: "3px solid #eab308",
                        borderRadius: 8,
                        padding: "12px 16px"
                      }}>
                        <div style={{ color: "#eab308", fontSize: "0.7rem", letterSpacing: "0.05em", marginBottom: 6 }}>
                          💡 TIP
                        </div>
                        <div style={{ color: "#a16207", fontSize: "0.82rem", lineHeight: 1.6 }}>
                          {selectedPattern.tip}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Nav */}
              <div style={{ borderTop: "1px solid #1e293b", padding: "14px 32px", background: "#0a0f1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  onClick={() => currentStep > 0 && goToStep(currentStep - 1)}
                  disabled={currentStep === 0}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 6,
                    background: "transparent",
                    border: "1px solid #334155",
                    color: currentStep === 0 ? "#1e293b" : "#64748b",
                    cursor: currentStep === 0 ? "not-allowed" : "pointer",
                    fontSize: "0.8rem"
                  }}
                >
                  ← 前へ
                </button>

                <div style={{ color: "#334155", fontSize: "0.75rem" }}>
                  {STEPS[currentStep].label} ({currentStep + 1} / {STEPS.length})
                </div>

                {currentStep < STEPS.length - 1 ? (
                  <button
                    onClick={handleNext}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 6,
                      background: CATEGORIES[selectedPattern.category].color,
                      border: "none",
                      color: "#000",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 600
                    }}
                  >
                    次へ →
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 10 }}>
                    {completedPatterns.has(selectedPattern.id) && (
                      <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#4ade80", fontSize: "0.8rem" }}>
                        ✓ 完了
                      </span>
                    )}
                    <button
                      onClick={() => {
                        const patterns = filteredPatterns;
                        const idx = patterns.findIndex(p => p.id === selectedPattern.id);
                        if (idx < patterns.length - 1) selectPattern(patterns[idx + 1]);
                      }}
                      style={{
                        padding: "8px 20px",
                        borderRadius: 6,
                        background: "#1e293b",
                        border: "1px solid #334155",
                        color: "#94a3b8",
                        cursor: "pointer",
                        fontSize: "0.8rem"
                      }}
                    >
                      次のパターン →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}