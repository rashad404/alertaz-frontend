import { Metadata } from "next";
import { getDictionary } from "@/get-dictionary";
import Link from "next/link";
import { BookOpen, Calculator, CreditCard, TrendingUp, Shield, PiggyBank } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang);
  
  return {
    title: dictionary.education || "Financial Education",
    description: "Learn about personal finance, credit management, and financial literacy",
  };
}

export default async function EducationPage({
  params,
}: {
  params: { lang: string };
}) {
  const dictionary = await getDictionary(params.lang);

  const topics = [
    {
      icon: CreditCard,
      title: dictionary.educationTopics?.creditBasics || "Credit Basics",
      description: dictionary.educationTopics?.creditBasicsDesc || "Understanding how credit works and how to build good credit",
      articles: 5,
      color: "bg-blue-500",
    },
    {
      icon: Calculator,
      title: dictionary.educationTopics?.budgeting || "Budgeting",
      description: dictionary.educationTopics?.budgetingDesc || "Learn to manage your money effectively",
      articles: 8,
      color: "bg-green-500",
    },
    {
      icon: PiggyBank,
      title: dictionary.educationTopics?.savings || "Savings & Investments",
      description: dictionary.educationTopics?.savingsDesc || "Build wealth through smart saving and investing",
      articles: 12,
      color: "bg-purple-500",
    },
    {
      icon: Shield,
      title: dictionary.educationTopics?.insurance || "Insurance",
      description: dictionary.educationTopics?.insuranceDesc || "Protect yourself and your assets",
      articles: 6,
      color: "bg-orange-500",
    },
    {
      icon: TrendingUp,
      title: dictionary.educationTopics?.investing || "Investing",
      description: dictionary.educationTopics?.investingDesc || "Grow your money through investments",
      articles: 10,
      color: "bg-indigo-500",
    },
    {
      icon: BookOpen,
      title: dictionary.educationTopics?.financialPlanning || "Financial Planning",
      description: dictionary.educationTopics?.financialPlanningDesc || "Plan for your financial future",
      articles: 7,
      color: "bg-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#FF6021] to-[#E54500] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold mb-4">
            {dictionary.education || "Financial Education"}
          </h1>
          <p className="text-xl opacity-90 max-w-3xl">
            {dictionary.educationHero || "Empower yourself with financial knowledge. Learn about credit, budgeting, investing, and more to make informed financial decisions."}
          </p>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          {dictionary.educationTopics?.title || "Topics"}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer group"
              >
                <div className={`w-12 h-12 ${topic.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {topic.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {topic.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    {topic.articles} {dictionary.articles || "articles"}
                  </span>
                  <span className="text-[#FF6021] group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Articles */}
      <div className="bg-white dark:bg-gray-800 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            {dictionary.featuredArticles || "Featured Articles"}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <article className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {dictionary.article1?.title || "How to Build Good Credit from Scratch"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {dictionary.article1?.desc || "Learn the fundamentals of building a strong credit history and improving your credit score."}
              </p>
              <Link href={`/${params.lang}/education/credit-basics`} className="text-[#FF6021] hover:underline">
                {dictionary.readMore || "Read more"} →
              </Link>
            </article>

            <article className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {dictionary.article2?.title || "Understanding Interest Rates"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {dictionary.article2?.desc || "Everything you need to know about how interest rates work and affect your loans."}
              </p>
              <Link href={`/${params.lang}/education/interest-rates`} className="text-[#FF6021] hover:underline">
                {dictionary.readMore || "Read more"} →
              </Link>
            </article>

            <article className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {dictionary.article3?.title || "Creating Your First Budget"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {dictionary.article3?.desc || "Step-by-step guide to creating and maintaining a personal budget."}
              </p>
              <Link href={`/${params.lang}/education/budgeting`} className="text-[#FF6021] hover:underline">
                {dictionary.readMore || "Read more"} →
              </Link>
            </article>

            <article className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {dictionary.article4?.title || "Insurance 101: What You Need to Know"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {dictionary.article4?.desc || "Understanding different types of insurance and choosing the right coverage."}
              </p>
              <Link href={`/${params.lang}/education/insurance-basics`} className="text-[#FF6021] hover:underline">
                {dictionary.readMore || "Read more"} →
              </Link>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}