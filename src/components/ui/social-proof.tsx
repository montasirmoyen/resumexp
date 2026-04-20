import { CircleCheckIcon } from 'lucide-react'
import Image from 'next/image'

type Feature = {
    title: string
    description: string
}

const SocialProof = ({ features }: { features: Feature[] }) => {
    return (
        <section className='py-8 sm:py-16 lg:py-24'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center gap-20 max-lg:flex-col'>
                    <div>
                        <div className='space-y-4'>
                            <p className='text-primary text-sm font-medium uppercase'>Why ResumeXP</p>
                            <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Everything you need to improve your resume with confidence</h2>
                            <p className='text-muted-foreground text-lg'>
                                Get an AI-powered review in seconds, understand how your resume performs, and apply
                                clear recommendations to increase your interview chances.
                            </p>
                        </div>

                        <ul className='mt-11 space-y-6 text-lg font-medium'>
                            {features.map((feature, index) => (
                                <li key={index} className='flex gap-2'>
                                    <CircleCheckIcon className='mt-0.75 size-5' />
                                    <div>
                                        <p>{feature.title}</p>
                                        <p className='text-muted-foreground text-base font-normal'>{feature.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SocialProof
